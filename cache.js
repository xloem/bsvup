/*
    This module handle local cache
    - TX cache
    - D record cache (TODO, but actually it's meaningless to cache D, because you still need to acquire latest D records every time)
    - B/Bcat/BcatPart record cache
    - PrivateKey cache
    - Unbroadcast TXs
*/
const bsv = require('bsv')
const fs = require('fs')
const crypto = require("crypto")

function init(){
    if(!fs.existsSync("./.bsv")){
        fs.mkdirSync("./.bsv")
    }
    // 初始化objects结构
    if(!fs.existsSync("./.bsv/objects")){
        fs.mkdirSync("./.bsv/objects")
    }
    // 初始化D镜像目录
    if(!fs.existsSync("./.bsv/tx")){
        fs.mkdirSync("./.bsv/tx")
    }
    if(!fs.existsSync("./.bsv/unbroadcast")){
        fs.mkdirSync("./.bsv/unbroadcast")
    }
    // 初始化D树文件
    if(!fs.existsSync("./.bsv/info")){
        fs.mkdirSync("./.bsv/info")
    }
}

function isKeyExist(){
    return fs.existsSync("./.bsv/key")
}

function loadKey(password){
    var buf = fs.readFileSync("./.bsv/key").toString()
    var decBuf = decrypt(buf, password)
    return bsv.PrivateKey(decBuf.toString())
}
function saveKey(privkey, password){
    var buf = Buffer.from(privkey.toString())
    var encBuf = encrypt(buf, password)
    fs.writeFileSync("./.bsv/key", encBuf)
}

function encrypt(plaintext, password){
    var cipher = crypto.createCipher('aes-128-ecb',password)
    return cipher.update(plaintext,'utf8','hex') + cipher.final('hex')
}
function decrypt(ciphertext, password){
    var cipher = crypto.createDecipher('aes-128-ecb',password)
    return cipher.update(ciphertext,'hex','utf8') + cipher.final('utf8')
}

function saveFileRecord(sha1, records){
    fs.writeFileSync(`./.bsv/objects/${sha1}`, JSON.stringify(records))
}

function loadFileRecord(sha1){
    try{
        return JSON.parse(fs.readFileSync(`./.bsv/objects/${sha1}`))
    }catch(err){
        return []
    }
}

function saveTX(tx){
    fs.writeFileSync(`./.bsv/tx/${tx.id}`, tx.toString())
    if (fs.existsSync(`./.bsv/unbroadcast/${tx.id}`)){
        fs.unlinkSync(`./.bsv/unbroadcast/${tx.id}`)
    }
}

function loadTX(txid){
    try{
        return bsv.Transaction(fs.readFileSync(`./.bsv/tx/${txid}`).toString())
    }catch(err){
        return null
    }
}

function saveUnbroadcastTX(tx){
    fs.writeFileSync(`./.bsv/unbroadcast/${tx.id}`, tx.toString())
}

function loadUnbroadcastList(){
    return fs.readdirSync('./.bsv/unbroadcast/')
}

function loadUnbroadcastTX(){
    try{
        return bsv.Transaction(fs.readFileSync(`./.bsv/unbroadcast/${txid}`).toString())
    }catch(err){
        return null
    }
}

module.exports = {
    initCache: init,
    isKeyExist: isKeyExist,
    loadKey: loadKey,
    saveKey: saveKey,
    saveFileRecord: saveFileRecord,
    loadFileRecord: loadFileRecord,
    saveTX: saveTX,
    loadTX: loadTX,
    saveUnbroadcastTX: saveUnbroadcastTX,
    loadUnbroadcastList: loadUnbroadcastList,
    loadUnbroadcastTX: loadUnbroadcastTX
}
