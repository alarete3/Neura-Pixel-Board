// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title NeuraPixelBoard
 * @notice Fully onchain pixel canvas where every pixel update is a real blockchain transaction
 * @dev No imports, no OpenZeppelin, no external libraries - pure Solidity
 */
contract NeuraPixelBoard {
    // ============ State Variables ============
    
    address public owner;
    bool public paused;
    bool private locked;
    
    uint256 public constant WIDTH = 64;
    uint256 public constant HEIGHT = 64;
    uint256 public pixelPrice;
    uint256 public totalPaints;
    uint256 public cooldownTime;
    
    // pixelId = y * WIDTH + x => color (uint24 RGB)
    mapping(uint256 => uint256) public pixelColor;
    
    // Cooldown tracking per user
    mapping(address => uint256) public lastPaintTimestamp;
    
    // ============ Events ============
    
    event PixelPainted(address indexed user, uint256 x, uint256 y, uint24 color);
    event PriceUpdated(uint256 newPrice);
    event Paused(bool isPaused);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event Withdrawn(address indexed to, uint256 amount);
    event CooldownUpdated(uint256 newCooldown);
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "PAUSED");
        _;
    }
    
    modifier nonReentrant() {
        require(!locked, "REENTRANT");
        locked = true;
        _;
        locked = false;
    }
    
    // ============ Constructor ============
    
    constructor() {
        owner = msg.sender;
        pixelPrice = 0.001 ether; // 0.001 ANKR
        cooldownTime = 5; // 5 seconds cooldown
        paused = false;
        locked = false;
        totalPaints = 0;
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Paint a pixel on the canvas
     * @param x X coordinate (0 to WIDTH-1)
     * @param y Y coordinate (0 to HEIGHT-1)
     * @param color RGB color as uint24 (e.g., 0xFF0000 for red)
     */
    function paintPixel(uint256 x, uint256 y, uint24 color) external payable whenNotPaused nonReentrant {
        // Validate bounds
        require(x < WIDTH, "X_OUT_OF_BOUNDS");
        require(y < HEIGHT, "Y_OUT_OF_BOUNDS");
        
        // Validate payment
        require(msg.value >= pixelPrice, "INSUFFICIENT_PAYMENT");
        
        // Check cooldown
        require(block.timestamp >= lastPaintTimestamp[msg.sender] + cooldownTime, "COOLDOWN_ACTIVE");
        
        // Calculate pixel ID
        uint256 pixelId = y * WIDTH + x;
        
        // Check if same color (optional optimization)
        require(pixelColor[pixelId] != color || pixelColor[pixelId] == 0, "SAME_COLOR");
        
        // Update pixel color
        pixelColor[pixelId] = color;
        
        // Update cooldown
        lastPaintTimestamp[msg.sender] = block.timestamp;
        
        // Increment total paints
        totalPaints++;
        
        // Emit event
        emit PixelPainted(msg.sender, x, y, color);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get the color of a specific pixel
     * @param x X coordinate
     * @param y Y coordinate
     * @return The RGB color as uint24
     */
    function getPixel(uint256 x, uint256 y) external view returns (uint24) {
        require(x < WIDTH, "X_OUT_OF_BOUNDS");
        require(y < HEIGHT, "Y_OUT_OF_BOUNDS");
        uint256 pixelId = y * WIDTH + x;
        return uint24(pixelColor[pixelId]);
    }
    
    /**
     * @notice Get board dimensions
     * @return width The canvas width
     * @return height The canvas height
     */
    function getBoardSize() external pure returns (uint256 width, uint256 height) {
        return (WIDTH, HEIGHT);
    }
    
    /**
     * @notice Get current pixel price
     * @return The price in wei
     */
    function getPixelPrice() external view returns (uint256) {
        return pixelPrice;
    }
    
    /**
     * @notice Get contract balance
     * @return The balance in wei
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @notice Check if user can paint (cooldown check)
     * @param user The user address
     * @return canPaint Whether user can paint
     * @return timeRemaining Seconds until cooldown ends (0 if can paint)
     */
    function canUserPaint(address user) external view returns (bool canPaint, uint256 timeRemaining) {
        uint256 nextPaintTime = lastPaintTimestamp[user] + cooldownTime;
        if (block.timestamp >= nextPaintTime) {
            return (true, 0);
        }
        return (false, nextPaintTime - block.timestamp);
    }
    
    /**
     * @notice Get a batch of pixels (for efficient loading)
     * @param startX Starting X coordinate
     * @param startY Starting Y coordinate
     * @param endX Ending X coordinate (exclusive)
     * @param endY Ending Y coordinate (exclusive)
     * @return colors Array of colors for the specified region
     */
    function getPixelBatch(uint256 startX, uint256 startY, uint256 endX, uint256 endY) 
        external view returns (uint24[] memory colors) 
    {
        require(startX < endX && endX <= WIDTH, "INVALID_X_RANGE");
        require(startY < endY && endY <= HEIGHT, "INVALID_Y_RANGE");
        
        uint256 width = endX - startX;
        uint256 height = endY - startY;
        colors = new uint24[](width * height);
        
        uint256 index = 0;
        for (uint256 y = startY; y < endY; y++) {
            for (uint256 x = startX; x < endX; x++) {
                uint256 pixelId = y * WIDTH + x;
                colors[index] = uint24(pixelColor[pixelId]);
                index++;
            }
        }
        
        return colors;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Update the pixel price
     * @param newPrice New price in wei
     */
    function setPixelPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "INVALID_PRICE");
        pixelPrice = newPrice;
        emit PriceUpdated(newPrice);
    }
    
    /**
     * @notice Update cooldown time
     * @param newCooldown New cooldown in seconds
     */
    function setCooldownTime(uint256 newCooldown) external onlyOwner {
        cooldownTime = newCooldown;
        emit CooldownUpdated(newCooldown);
    }
    
    /**
     * @notice Pause or unpause the contract
     * @param _paused New paused state
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(_paused);
    }
    
    /**
     * @notice Withdraw contract balance to owner
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "NO_BALANCE");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "TRANSFER_FAILED");
        
        emit Withdrawn(owner, balance);
    }
    
    /**
     * @notice Transfer ownership
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "INVALID_ADDRESS");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }
    
    // ============ Receive Function ============
    
    receive() external payable {}
}
