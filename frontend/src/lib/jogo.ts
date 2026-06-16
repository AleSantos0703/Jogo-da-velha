//https://www.programiz.com/javascript/online-compiler/
//https://www.typescriptlang.org/play/?#code/MYewdgzgLgBAtgQygJwJYC8BcNprAcwG0BdEmAXhkICgYqByMAVwBsX6AaGR19rntvWIdaDZoP7i+3KUJF1CA6Us4zeQ6sQDc1AG4JkMUGCgB9AFYh8CACYII5AAw7qxiCBYBTAHQsrACkQUDEIARlIAJmIASi0YAHp4mABlBABbu2wANmpqVAAzf2MzS2s7CAAeJ2iAb1E6eIAqRw5QxviCwKQ0dEJHUn7ycgAiAA1hmAAySfhukP6w4iGxienZ4N6FqOXx2vq6A7cPHz98fzGYAHdUSGHo-YBfXIOExtDW9s6ujcXFndWZkEer9BiNxlNAXNeuFCNswXcYAAfRHfYEw8L-CHrYELDHwrFAkJRP7w6J7F4vI5eXwBC7XW73F5PfZNCIfDqFQm9YmglYEqGw0h4vlrLmCwX-ckUuhUk600ZXG4QO6PZ4HJrvRyfTkCha88GigUw-UA7FEgZLUl1aUy8Duamnc4K+nKxkHZkvDUcCLa1HzSKWkWQn4wuFBs3cgOS6022U0s50pUqpm5NUNZrszpivWBgDypuzQrzBd1UZG+al0rjjuGucVDNVLLemcKfuhReW+f5IYtnZLPYl5YRyLbv2FXcNP1xxe7wOJ47ulYp1dpdZdyfdadebLaHNHPJnk7nHaHs-Ng9rdxjVbtx3j5zXSbddA96ubWr3hb6h+DaN7p6Pc9eQra9l1vB1V3rV1G09ZsfU-UsLwnX8QlDH8I3FMMQP2SlwLlBNHwbFNmU6YoLCsWx7CGABOPYVwTABROAAAckE8FUHiAA
const matriz: string[][] = [
  ['null', 'null', 'null'],
  ['null', 'null', 'null'],
  ['null', 'null', 'null']
];
var cont_jogadas=0;

console.log(matriz[1][2]); // Saída: 6

if(cont_jogadas<=1){
    /*0,1*/if(matriz[0][0]=="X" && matriz[0][1]=="X" && matriz[0][2]=="X"){
        console.log("X wins")
    }

    /*1,1*/if((matriz[1][1]=="X" && matriz[1][0]=="X" && matriz[1][2]=="X") ||(matriz[1][1]=="X" && matriz[0][1]=="X" && matriz[2][1]=="X")){
        console.log("X wins")
    }

    /*2,1*/if(matriz[2][0]=="X" && matriz[2][1]=="X" && matriz[2][2]=="X"){
        console.log("X wins")
    }

    /*1,0*/if(matriz[0][0]=="X" && matriz[1][0]=="X" && matriz[2][0]=="X"){
        console.log("X wins")
    }

    /*1,2*/if(matriz[0][2]=="X" && matriz[1][2]=="X" && matriz[2][2]=="X"){
        console.log("X wins")
    }



    /*0,1*/if(matriz[0][0]=="O" && matriz[0][1]=="O" && matriz[0][2]=="O"){
        console.log("O wins")
    }

    /*1,1*/if((matriz[1][1]=="O" && matriz[1][0]=="O" && matriz[1][2]=="O") ||(matriz[1][1]=="O" && matriz[0][1]=="O" && matriz[2][1]=="O")){
        console.log("O wins")
    }

    /*2,1*/if(matriz[2][0]=="O" && matriz[2][1]=="O" && matriz[2][2]=="O"){
        console.log("O wins")
    }

    /*1,0*/if(matriz[0][0]=="O" && matriz[1][0]=="O" && matriz[2][0]=="O"){
        console.log("O wins")
    }

    /*1,2*/if(matriz[0][2]=="O" && matriz[1][2]=="O" && matriz[2][2]=="O"){
        console.log("O wins")
    }
}

if(cont_jogadas==9){
console.log("Empate")
}