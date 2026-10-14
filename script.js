// ====== CONFIG: change if your FastAPI runs elsewhere ======
const API = "https://nyc-airbnb-room-type-predictor-l7ng.onrender.com";

const HOODS = {
"Manhattan":"Battery Park City|Chelsea|Chinatown|Civic Center|East Harlem|East Village|Financial District|Flatiron District|Gramercy|Greenwich Village|Harlem|Hell's Kitchen|Inwood|Kips Bay|Little Italy|Lower East Side|Marble Hill|Midtown|Morningside Heights|Murray Hill|NoHo|Nolita|Roosevelt Island|SoHo|Stuyvesant Town|Theater District|Tribeca|Two Bridges|Upper East Side|Upper West Side|Washington Heights|West Village",
"Brooklyn":"Bath Beach|Bay Ridge|Bedford-Stuyvesant|Bensonhurst|Bergen Beach|Boerum Hill|Borough Park|Brighton Beach|Brooklyn Heights|Brownsville|Bushwick|Canarsie|Carroll Gardens|Clinton Hill|Cobble Hill|Columbia St|Coney Island|Crown Heights|Cypress Hills|DUMBO|Downtown Brooklyn|Dyker Heights|East Flatbush|East New York|Flatbush|Flatlands|Fort Greene|Fort Hamilton|Gowanus|Gravesend|Greenpoint|Kensington|Manhattan Beach|Midwood|Mill Basin|Navy Yard|Park Slope|Prospect Heights|Prospect-Lefferts Gardens|Red Hook|Sea Gate|Sheepshead Bay|South Slope|Sunset Park|Vinegar Hill|Williamsburg|Windsor Terrace",
"Queens":"Arverne|Astoria|Bay Terrace|Bayside|Bayswater|Belle Harbor|Bellerose|Breezy Point|Briarwood|Cambria Heights|College Point|Corona|Ditmars Steinway|Douglaston|East Elmhurst|Edgemere|Elmhurst|Far Rockaway|Flushing|Forest Hills|Fresh Meadows|Glendale|Hollis|Holliswood|Howard Beach|Jackson Heights|Jamaica|Jamaica Estates|Jamaica Hills|Kew Gardens|Kew Gardens Hills|Laurelton|Little Neck|Long Island City|Maspeth|Middle Village|Neponsit|Ozone Park|Queens Village|Rego Park|Richmond Hill|Ridgewood|Rockaway Beach|Rosedale|South Ozone Park|Springfield Gardens|St. Albans|Sunnyside|Whitestone|Woodhaven|Woodside",
"Bronx":"Allerton|Baychester|Belmont|Bronxdale|Castle Hill|City Island|Claremont Village|Clason Point|Co-op City|Concourse|Concourse Village|East Morrisania|Eastchester|Edenwald|Fieldston|Fordham|Highbridge|Hunts Point|Kingsbridge|Longwood|Melrose|Morris Heights|Morris Park|Morrisania|Mott Haven|Mount Eden|Mount Hope|North Riverdale|Norwood|Olinville|Parkchester|Pelham Bay|Pelham Gardens|Port Morris|Riverdale|Schuylerville|Soundview|Spuyten Duyvil|Throgs Neck|Tremont|Unionport|University Heights|Van Nest|Wakefield|West Farms|Westchester Square|Williamsbridge|Woodlawn",
"Staten Island":"Arden Heights|Arrochar|Bay Terrace, Staten Island|Bull's Head|Castleton Corners|Clifton|Concord|Dongan Hills|Eltingville|Emerson Hill|Graniteville|Grant City|Great Kills|Grymes Hill|Howland Hook|Huguenot|Mariners Harbor|Midland Beach|New Brighton|New Dorp|New Dorp Beach|New Springville|Oakwood|Port Richmond|Prince's Bay|Randall Manor|Rosebank|Rossville|Shore Acres|Silver Lake|South Beach|St. George|Stapleton|Todt Hill|Tompkinsville|Tottenville|West Brighton|Westerleigh|Willowbrook"
};
const CENTER = {"Manhattan":[40.7831,-73.9712],"Brooklyn":[40.6782,-73.9442],"Queens":[40.7282,-73.7949],"Bronx":[40.8448,-73.8648],"Staten Island":[40.5795,-74.1502]};
// Order MUST match model.classes_
const CLASSES = [
 {name:"Entire home/apt",icon:"🏠",col:"#7c5cff"},
 {name:"Private room",icon:"🛏️",col:"#22d3ee"},
 {name:"Shared room",icon:"👥",col:"#ff5c9d"}];
const PRESETS = {
 loft:{g:"Manhattan",n:"SoHo",price:320,min:3,rev:48,rpm:1.8,host:2,avail:210},
 room:{g:"Brooklyn",n:"Bedford-Stuyvesant",price:75,min:2,rev:30,rpm:1.1,host:1,avail:120},
 bunk:{g:"Queens",n:"Jamaica",price:35,min:1,rev:9,rpm:0.6,host:6,avail:340}};
const BOUNDS = {latMin:40.49,latMax:40.92,lngMin:-74.27,lngMax:-73.68};
const $ = id => document.getElementById(id);
const F = ["latitude","longitude","price","minimum_nights","number_of_reviews","reviews_per_month","calculated_host_listings_count","availability_365","neighbourhood_group","neighbourhood"];

// ---------- selects ----------
Object.keys(HOODS).forEach(b => $("neighbourhood_group").add(new Option(b,b)));
function fillHoods(sel){
  const s = $("neighbourhood"); s.innerHTML = "";
  HOODS[$("neighbourhood_group").value].split("|").forEach(h => s.add(new Option(h,h)));
  if(sel) s.value = sel;
}
function setCoords(lat,lng){
  $("latitude").value = (+lat).toFixed(5); $("longitude").value = (+lng).toFixed(5); movePin();
}
function movePin(){
  const lat=+$("latitude").value, lng=+$("longitude").value, B=BOUNDS;
  const x=(lng-B.lngMin)/(B.lngMax-B.lngMin)*100, y=(B.latMax-lat)/(B.latMax-B.latMin)*100;
  $("pin").style.left=Math.min(98,Math.max(2,x))+"%"; $("pin").style.top=Math.min(96,Math.max(4,y))+"%";
}
$("neighbourhood_group").onchange = () => { fillHoods(); setCoords(...CENTER[$("neighbourhood_group").value]); };
$("map").onclick = e => {
  const r=$("map").getBoundingClientRect(), B=BOUNDS;
  setCoords(B.latMax-(e.clientY-r.top)/r.height*(B.latMax-B.latMin), B.lngMin+(e.clientX-r.left)/r.width*(B.lngMax-B.lngMin));
};
["latitude","longitude"].forEach(i => $(i).oninput = movePin);

// ---------- live slider labels ----------
const sliders = {price:v=>"$"+v, availability_365:v=>v+" / 365 days", minimum_nights:v=>v+(v==1?" night":" nights")};
const outs = {price:"priceOut",availability_365:"availOut",minimum_nights:"minOut"};
Object.keys(sliders).forEach(k => {
  const upd = () => $(outs[k]).textContent = sliders[k]($(k).value);
  $(k).oninput = upd; upd();
});

// ---------- presets ----------
function applyPreset(p){
  $("neighbourhood_group").value = p.g; fillHoods(p.n); setCoords(...CENTER[p.g]);
  Object.assign(Object.fromEntries([]),{});
  $("price").value=p.price; $("minimum_nights").value=p.min; $("number_of_reviews").value=p.rev;
  $("reviews_per_month").value=p.rpm; $("calculated_host_listings_count").value=p.host; $("availability_365").value=p.avail;
  Object.keys(sliders).forEach(k => $(k).dispatchEvent(new Event("input")));
}
document.querySelectorAll("[data-preset]").forEach(b => b.onclick = () => applyPreset(PRESETS[b.dataset.preset]));

// ---------- helpers ----------
let tt; function toast(m){ const t=$("toast"); t.textContent=m; t.classList.add("show"); clearTimeout(tt); tt=setTimeout(()=>t.classList.remove("show"),4500); }
function countUp(el,to,ms=1100,cb){
  const t0=performance.now();
  (function f(t){ const k=Math.min(1,(t-t0)/ms), v=to*(1-Math.pow(1-k,3)); el.textContent=v.toFixed(1)+"%"; cb&&cb(v); if(k<1) requestAnimationFrame(f); })(t0);
}

// ---------- API status ----------
async function ping(){
  const p=$("apiPill"); p.className="pill"; p.lastElementChild.textContent="Checking API…";
  try{ const r=await fetch(API+"/"); if(!r.ok) throw 0; p.className="pill on"; p.lastElementChild.textContent="API online"; }
  catch{ p.className="pill off"; p.lastElementChild.textContent="API offline · retry"; }
}
$("apiPill").onclick = ping;

// ---------- validation (mirrors the Pydantic model) ----------
const RULES = {
 latitude:[-90,90,false], longitude:[-180,180,false], price:[0,Infinity,false,true],
 minimum_nights:[1,365,true], number_of_reviews:[0,Infinity,true], reviews_per_month:[0,Infinity,false],
 calculated_host_listings_count:[0,Infinity,true], availability_365:[0,365,true]};
function collect(){
  const body={}, bad=[];
  for(const k of F){
    const el=$(k); el.classList.remove("bad"); let v=el.value.trim();
    if(k in RULES){
      const [lo,hi,int,gtOnly]=RULES[k]; v = int?parseInt(v,10):parseFloat(v);
      if(Number.isNaN(v)||v<lo||v>hi||(gtOnly&&v<=lo)||(int&&!Number.isInteger(+el.value))) bad.push(k);
    } else if(!v) bad.push(k);
    body[k]=v;
  }
  bad.forEach(k => $(k).classList.add("bad"));
  return bad.length ? null : body;
}

// ---------- predict ----------
const history=[];
$("form").onsubmit = async e => {
  e.preventDefault();
  const body=collect(); if(!body) return toast("Please fix the highlighted fields.");
  const btn=$("go"); btn.classList.add("load"); btn.disabled=true;
  try{
    const r=await fetch(API+"/predict",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const d=await r.json();
    if(!r.ok) throw new Error(r.status===422 ? "Validation: "+d.detail.map(x=>x.loc.slice(-1)+" – "+x.msg).join("; ") : "Server error "+r.status);
    show(d,body); ping();
  }catch(err){ toast(err instanceof TypeError ? "Can't reach the API at "+API+". Is uvicorn running?" : err.message); $("apiPill").className="pill off"; }
  finally{ btn.classList.remove("load"); btn.disabled=false; }
};

function show(d,body){
  const card=$("result"); card.classList.remove("empty"); card.querySelector(".ph").hidden=true;
  const out=card.querySelector(".out"); out.hidden=false; out.style.animation="none"; out.offsetHeight; out.style.animation="";
  const probs=d.probability; let top=probs.indexOf(Math.max(...probs));
  const c=CLASSES.find(x=>x.name===d.predicted_room_type) || CLASSES[top];
  top=CLASSES.indexOf(c);
  $("icon").textContent=c.icon; $("label").textContent=d.predicted_room_type; $("ring").style.setProperty("--col",c.col);
  countUp($("pct"),probs[top]*100,1200,v=>$("ring").style.setProperty("--p",v));
  $("bars").innerHTML = CLASSES.map((k,i)=>`<div class="row ${i===top?"top":""}"><span>${k.icon} ${k.name}</span><div class="t"><div class="f" style="background:${k.col}"></div></div><span>${(probs[i]*100).toFixed(1)}%</span></div>`).join("");
  requestAnimationFrame(()=>requestAnimationFrame(()=>document.querySelectorAll(".f").forEach((f,i)=>f.style.width=(probs[i]*100)+"%")));
  history.unshift(`<li><div>${c.icon} ${d.predicted_room_type}<br><span>${body.neighbourhood} · $${body.price}</span></div><b>${(probs[top]*100).toFixed(0)}%</b></li>`);
  $("hist").innerHTML=history.slice(0,5).join(""); $("histCard").hidden=false;
}

// ---------- init ----------
applyPreset(PRESETS.loft); ping();
