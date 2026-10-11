const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('dist/script.js', 'utf8');
const functions = source.slice(source.indexOf("let exportFilename ="), source.indexOf("$('#close-export').addEventListener"));
function setup(clipboard) {
  const elements = Object.fromEntries(['export-code','export-title','export-status','export-dialog'].map(id=>[id,{value:'',textContent:'',open:false,focus(){},select(){this.selected=true},setSelectionRange(start,end){this.selection=[start,end]},showModal(){this.open=true}}]));
  const notices=[];
  const context = vm.createContext({navigator:clipboard ? {clipboard} : {}, $:s=>elements[s.slice(1)], toast:s=>notices.push(s)});
  vm.runInContext(functions,context);
  return {elements,notices,run:()=>vm.runInContext("copy('<h1>My work</h1>', {filename:'index.html',title:'My page',show:true})", context)};
}
test('successful copy sends exact HTML and leaves a viewable export',async()=>{
 let written;const x=setup({writeText:async text=>{written=text}});
 assert.equal(await x.run(),true); assert.equal(written,'<h1>My work</h1>');
 assert.equal(x.elements['export-code'].value,written); assert.equal(x.elements['export-dialog'].open,true);
 assert.match(x.elements['export-status'].textContent,/Copied!/);
});
test('clipboard rejection keeps selected code and explains manual copy',async()=>{
 const x=setup({writeText:async()=>{throw new Error('NotAllowedError')}});
 assert.equal(await x.run(),false); assert.equal(x.elements['export-dialog'].open,true);
 assert.equal(x.elements['export-code'].value,'<h1>My work</h1>');
 assert.equal(x.elements['export-code'].selection[1],16);
 assert.match(x.elements['export-status'].textContent,/did not allow automatic copying/);assert.equal(x.notices.length,0);
});
test('missing Clipboard API still exposes code and download guidance',async()=>{
 const x=setup();assert.equal(await x.run(),false);
 assert.equal(x.elements['export-code'].selected,true);assert.match(x.elements['export-status'].textContent,/Download HTML/);
});
test('synchronous clipboard exception does not lose export',async()=>{
 const x=setup({writeText:()=>{throw new Error('Unavailable')}});assert.equal(await x.run(),false);
 assert.equal(x.elements['export-code'].value,'<h1>My work</h1>');
});
