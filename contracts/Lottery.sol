pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;
    
    //init
    function Lottery() public {
        // msg is a global
        manager = msg.sender;
    }
    
    // Can send ether along so payable
    function enter() public payable {
        // Used for validation.... .01 ether converted to wei
        require(msg.value > 0.01 ether);
        
        players.push(msg.sender);
    }
    
    function random() private view returns(uint){
        // hash the 3 args to generate a random number
        return uint(keccak256(block.difficulty, now, players));
    }
    
    function pickWinner() public restricted {
        uint index = random() % players.length;
        // this is reference to the contranct and balance is the amount of money existing in the contract
        players[index].transfer(this.balance); // return a single address type
        // initialize a dynamic array of addresses with an initial size of 0
        players = new address[](0);
    }
    
    // like a function decorator in python
    modifier restricted() {
        // Ensure only a manager can access this function
        require(msg.sender == manager);
        _; // decorated func replaces the underscore inplace
    }
    
    function getPlayers() public view returns (address[]) {
        return players;
    }

}