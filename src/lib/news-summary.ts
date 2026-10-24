/** Short publisher-provided previews; never generate facts from a headline. */
export function newsPreview(description:string,content:string,title:string):string {
 const decode=(value:string)=>value.replace(/&(?:amp|nbsp|quot|apos|lt|gt|ndash|mdash|rsquo|lsquo|rdquo|ldquo|hellip|middot);|&#(?:x[0-9a-f]+|\d+);/gi,entity=>{
  const named:Record<string,string>={'&amp;':'&','&nbsp;':' ','&quot;':'"','&apos;':"'",'&lt;':'<','&gt;':'>','&ndash;':'–','&mdash;':'—','&rsquo;':'’','&lsquo;':'‘','&rdquo;':'”','&ldquo;':'“','&hellip;':'…','&middot;':'·'};
  if(named[entity.toLowerCase()])return named[entity.toLowerCase()];
  const hex=/^&#x/i.test(entity),code=parseInt(entity.slice(hex?3:2,-1),hex?16:10);
  return code>0&&code<=0x10ffff?String.fromCodePoint(code):' ';
 });
 const markup=(value:string)=>{
  let html=value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1');
  // Feeds can contain escaped HTML, including embedded charts and their scripts.
  for(let i=0;i<3;i++)html=decode(html);
  return html.replace(/<(script|style|iframe|figure|table)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<!--[\s\S]*?-->/g,' ');
 };
 const text=(value:string)=>value.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
 const heading=text(markup(title)).toLowerCase();
 const opening=(value:string)=>{
  const html=markup(value);
  const paragraphs=[...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map(p=>text(p[1]));
  if(paragraphs.length)return paragraphs.find(p=>p.length>=30&&p.toLowerCase()!==heading)??'';
  return text(html.split(/\n\s*\n/)[0]??'');
 };
 const desc=opening(description),intro=opening(content);
 const choices=desc.split(/\s+/).length<25&&intro.split(/\s+/).length>=25?[intro,desc]:[desc,intro];
 const candidate=choices.find(value=>value.length>=30&&value.toLowerCase()!==heading)??'';
 if(!candidate)return '';
 const words=candidate.split(/\s+/);
 return words.length<=45?candidate:words.slice(0,45).join(' ').replace(/[,;:]$/,'')+'…';
}
