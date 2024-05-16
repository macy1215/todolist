// Node.js內建的模組
const http = require('http'); 
//加上外部 NPM uuid
const {v4: uuidv4} = require('uuid');
//加上自己的除錯處理JS模組
const errHandle = require('./errorHandle');

const todos = [
    // {
    //     "title":"今天要刷牙",
    //     "id":uuidv4()
    // },
    // {
    //     "title":"今天要拉屎",
    //     "id":uuidv4()
    // }
];

const requestListener = (req, res) =>{
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
       'Content-Type': 'application/json'
     }
    let body = "";
    
    req.on('data',chunk => {
        body+=chunk;
    })
    
    if(req.url =="/todos" && req.method == "GET"){ // 首頁 get
        res.writeHead(200,headers);
        res.write(JSON.stringify({
            "status":"success",
            "data":todos,
        }));
        res.end();
    } else if(req.url =="/todos" && req.method == "POST"){ // 新增 API
        req.on("end",()=>{
            try{
                const title = JSON.parse(body).title;
                if(title !== undefined){ // 如果 title 是 undefined 就不會執行
                    console.log(title);
                    const todo ={
                        "title":title,
                        "id": uuidv4(),
                    }
                    todos.push(todo);
                    console.log(todo);
                    res.writeHead(200,headers);
                    res.write(JSON.stringify({
                    "status":"success",
                    "data":todos,
                    }));
                    res.end();
                }else{
                    errHandle(res); // res 
                }
            }catch(error){
                errHandle(res); // res 
            }
        })
    } else if(req.url == "/todos" && req.method == "DELETE"){  //Delete 全部
        todos.length = 0;
        res.writeHead(200,headers);
        res.write(JSON.stringify({
            "status":"success",
            "data":todos,
        }));
        res.end();
    } else if(req.url.startsWith("/todos/") && req.method == "DELETE"){ //Delete 單筆
        const id = req.url.split('/').pop();
        const index = todos.findIndex( element => element.id === id); //element 是物件資料格式
        if(index !== -1){ //先判斷有沒有在 index，有索引我才去做刪除
            todos.splice(index,1); // splice 中的index 值中的第一筆資訊
            res.writeHead(200,headers);
            res.write(JSON.stringify({
                "status":"success",
                "data":todos,
            }));
            res.end();
        }else{
            errHandle(res);
        }
    } else if(req.url.startsWith("/todos/") && req.method == "PATCH"){ // Patch 編輯
        req.on('end',()=>{ // req.on觸發
            try{
                const todo = JSON.parse(body).title; // 定義todo資料寫入req title 的值
                const id = req.url.split('/').pop(); // delete 資訊
                const index = todos.findIndex(element => element.id == id);  // 新增索引值，todos中依序找到ID /req回傳的id 做比對
                if(todo !== undefined && index !== -1){ //確定有 title 屬性與確定有正確 id 的索引值。
                    console.log('裡面的',todo,id,index);
                    todos[index].title = todo; // 將新的todo 資料寫進 todos 的陣列中。搭配索引值。
                    res.writeHead(200,headers);
                    res.write(JSON.stringify({
                        "status":"success",
                        "data":todos,
                    }));
                    res.end(); // 這樣才會 response 回來
                }else{
                    errHandle(res); // 跑出錯誤res
                }
            }catch{
                errHandle(res); // 跑出錯誤res
            }
        })
    }else if(req.method == "OPTIONS"){ // preflighted 請求測試 支援跨網域
        res.writeHead(200,headers);
        res.end();
    }
    else{
        res.writeHead(404,headers);
        res.write(JSON.stringify({
            "status":"false",
            "message":"無此網站路由",
        }));
        res.end(); 
    }

}

const server = http.createServer(requestListener);
server.listen(3005);