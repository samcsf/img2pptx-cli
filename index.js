const pptx = require('pptxgenjs')
const fs = require('fs')
const path = require('path')
const program = require('commander')
const DEFAULT_CONFIG = {
    //todo: sort : true
    max : 999,
    extensions : ['.png','.jpg','.jpeg','.gif','.bmp','.raw']
}

/**
 *  Options:
 *   -c config file  
 *   -b background color or background pic 
 *   -f source img folder
 *   -o keep orign img size, default filling fullscreen
 *   -n add text from file name 
 */

program
    .version('0.1.0')
    .option('-f, --folder [path]','Image folder path')
    .option('-t, --target [path]','PPTX output path')
    .option('-c, --config [path]','Config to override, testing')
    .option('-n, --name-gen','Generate file name to slide')
    .option('-o, --orig-size','Origin size, testing')
    .option('-b, --background [path]','Background image or color')
    .parse(process.argv)

// console.log('folder ' + program.folder)
// console.log('target ' + program.target)
// console.log('config ' + program.config)
// console.log('nameGen ' + program.nameGen)
// console.log('origSize ' + program.origSize)
// console.log('background ' + program.background)

let imgDir = getRealPath(program.folder)
let outPath = getRealPath(program.target)
let config = program.config ? require(getRealPath(program.config)) : DEFAULT_CONFIG  

function getRealPath(inputPath){
    if(!path.isAbsolute(inputPath))
        return inputPath
    else
        return path.join(__dirname, inputPath)
}

function Validator(rules){
    this.ruleStack = rules || []
    this.loadRule = function(fn){
        this.ruleStack.push(fn)
    }
    this.validate = function(){
        let parms = Array.prototype.slice.call(arguments,0)
        for(let i in this.ruleStack){
            let res = Reflect.apply(this.ruleStack[i],null,parms)
            if (!res){
                return false
            }
        }
        return true
    }
}

/**
 *   Rules
 */

function checkExt(list){
    return function(fullpath){
        let ext = path.extname(fullpath).toLowerCase()
        return list.indexOf(ext)>=0
    }
}

function checkLimit(max){
    let counter = 0
    function check(){
        return ++counter <= max
    }
    return check
}

function checkFile(){
    return function(fullpath){
        return fs.statSync(fullpath).isFile()
    }
}

function checkNotEqual(b){
    return function(a){
        return a != b
    }
}

function checkBackground(){
    return function(options){
        let bg = options['background']
        if(!bg)
            return true

        if(path.extname(bg) === ''){
            if((/^[0-9|a-f]{6}$/i).test(bg)){
                //indicate background is color mode
                options['bgcolor'] = true
                return true
            }else{
                console.log('Background image not valid.')
                return false
            }
        }
        //check existence
        let bgPath = getRealPath(bg)
        try{
            let stat = fs.statSync(bgPath)
            console.log('Background stat ' + stat)
            return true
        }
        catch(err){
            console.log('Background image not found in ' + bgPath)
            return false
        }
    }
}

function generate(){
    let cmdValidator = new Validator()
    cmdValidator.loadRule(checkBackground())
    if(!cmdValidator.validate(program)){
        console.error('Generation fail due to error.')
        return
    }

    let fileValidator = new Validator()
    fileValidator.loadRule(checkFile())
    fileValidator.loadRule(checkExt(DEFAULT_CONFIG.extensions))
    if(program.background && !program.bgcolor)
        fileValidator.loadRule(checkNotEqual(getRealPath(program.background)))
    fileValidator.loadRule(checkLimit(DEFAULT_CONFIG.max))

    let fileList = fs.readdirSync(imgDir)
    
    //todo: sorting
    // if(DEFAULT_CONFIG.sort)
    //     fileList.sort()
    
    for(let file of fileList){
        let fullpath = path.join(imgDir,file)
        if(fileValidator.validate(fullpath)){
            addImgSlide(fullpath)
        }
    }
    pptx.save(outPath, function(path){console.log('Done. PPTX generated to ' + path)})
}

function addImgSlide(imgPath){
    console.log('Adding ' + imgPath)
    let ext = path.extname(imgPath)
    let base = path.basename(imgPath)
    let filename = base.replace(ext, '')
    let slide = null
    let slideOpts = {}
    if(program['bgcolor']) 
        slideOpts.bkgd = program['background']

    slide = pptx.addNewSlide(slideOpts)

    if(program['background'] && !program['bgcolor'])
        slide.addImage({ path:program['background'], x:0, y:0, w:'100%', h:'100%'})

    if(program['origSize'])
        slide.addImage({ path:imgPath, x:'30%', y:'30%'})
    else //default
        slide.addImage({ path:imgPath, x:0, y:0, w:'100%', h:'100%'})

    if(program['nameGen'])
        slide.addText(filename,{ x:'40%', y:0, font_size:12, font_face:'Arial', color:'E4E4E4' })
}

//run
generate()