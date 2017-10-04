# Img2pptx
A simple CLI for creating pptx from images folder. Using [PptxGenJS](https://github.com/gitbrent/PptxGenJS) for pptx generation.

### Installation
```bash
$ npm install -g img2pptx-cli
```

### Usage
- -f, --folder [path] , Image folder path  
- -t, --target [path] , PPTX output path  
- -n, --name-gen      , Generate file name to slide 

Example: 
```
|- pics  
     |--pic01.jpg  
     |--pic02.jpg  
     |--pic03.jpg  
     |--pic04.jpg  
```

Use generate command : 
```bash
$ img2pptx -f ./pics -t ./my-pptx
```
A new pptx file will be generated contains all the images in each individual slide.
```
./my-pptx.pptx
___________________________________  
|  _         ____________________  |  
| |_| pic01 |       __           | |  
|  _        |   __(    )__       | |  
| |_| pic01 |  ( __ (o)  __)     | |  
|  _        |      ( _ )    (o)  | |  
| |_| pic03 |     \_ | _/   \|/  | |  
|       :   |____________________| |            
|__________________________________|
```

### Version
0.1.2

### License
[MIT](http://opensource.org/licenses/MIT)
