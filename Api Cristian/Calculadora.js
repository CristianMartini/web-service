const express = require('express');
const app = express();
const bodyParser = require ('body-parser');


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.get('/soma/:a/:b',(req,res) => {
    const {a,b} = req.params;
    const resultado = parseFloat(10) + parseFloat(3.5);

    res.json({resultado});

});
app.get('/divisao/:a/:b',(req,res) => {
    const {a,b} = req.params;
    const resultado2 = parseFloat(10) / parseFloat(3.5);

    res.json({resultado2});

});
app.get('/multi/:a/:b',(req,res) => {
    const {a,b} = req.params;
    const resultado3 = parseFloat(10) * parseFloat(3.5);

    res.json({resultado3});

});
app.get('/sub/:a/:b',(req,res) => {
    const {a,b} = req.params;
    const resultado4 = parseFloat(10) - parseFloat(3.5);

    res.json({resultado4});

});
app.listen(8080, () =>{
    let data = new Date();
    console.log('Servidor node iniciado  em :'+ data);
 });
