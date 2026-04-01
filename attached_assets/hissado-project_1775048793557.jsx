import { useState, useEffect, useMemo, useRef } from "react";

const STORE_KEY = "hissado-pm-v3";
async function load() { try { const r = await window.storage.get(STORE_KEY); return r ? JSON.parse(r.value) : null; } catch { return null; } }
async function save(d) { try { await window.storage.set(STORE_KEY, JSON.stringify(d)); } catch(e) { console.error(e); } }

const uid = () => Math.random().toString(36).slice(2,10);
const now = new Date();
const fmt = d => d.toISOString().split("T")[0];
const fmtT = d => new Date(d).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
const addD = (d,n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r; };
const addH = (d,n) => { const r=new Date(d); r.setHours(r.getHours()+n); return r; };

const I = {
  home:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  folder:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  folderOpen:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 2h4a2 2 0 0 1 2 2v1M5 19h14a2 2 0 0 0 2-2l1-9H4l1 9z"/></svg>,
  check:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  users:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  cal:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  chart:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  gear:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></svg>,
  plus:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  search:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  bell:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  x:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chR:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  chL:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  edit:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  clock:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  msg:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  chat:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  clip:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
  list:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  board:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
  send:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  file:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  fileP:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  dl:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  grid:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  smile:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
};

// ─── COLORS ───
const C = {navy:"#0F1A2E",navyL:"#162240",navyM:"#1C2D4A",gold:"#C8A45C",goldL:"#D4B87A",goldD:"#A8883E",w:"#FFF",g50:"#F8F9FC",g100:"#F0F2F7",g200:"#E2E5EE",g300:"#C8CDD8",g400:"#9BA3B5",g500:"#6B7489",g600:"#4A5268",g700:"#343B4F",ok:"#22C55E",warn:"#F59E0B",err:"#EF4444",info:"#3B82F6"};
const PC = {Low:{bg:"#E8F5E9",t:"#2E7D32",d:"#4CAF50"},Medium:{bg:"#FFF3E0",t:"#E65100",d:"#FF9800"},High:{bg:"#FCE4EC",t:"#C62828",d:"#EF5350"},Urgent:{bg:"#F3E5F5",t:"#6A1B9A",d:"#AB47BC"}};
const SC = {"To Do":{bg:C.g200,t:C.g600,a:C.g400},"In Progress":{bg:"#DBEAFE",t:"#1E40AF",a:"#3B82F6"},"In Review":{bg:"#FEF3C7",t:"#92400E",a:"#F59E0B"},"Done":{bg:"#D1FAE5",t:"#065F46",a:"#10B981"}};
const FT = {pdf:{c:"#EF4444",l:"PDF"},doc:{c:"#3B82F6",l:"DOC"},xls:{c:"#22C55E",l:"XLS"},png:{c:"#8B5CF6",l:"PNG"},fig:{c:"#EC4899",l:"FIG"},csv:{c:"#14B8A6",l:"CSV"},pptx:{c:"#F97316",l:"PPTX"},md:{c:"#6366F1",l:"MD"},jpg:{c:"#F59E0B",l:"JPG"},zip:{c:"#6B7280",l:"ZIP"}};
const STS = ["To Do","In Progress","In Review","Done"];
const PRI = ["Low","Medium","High","Urgent"];

const css = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@400;500;600;700&display=swap');*{margin:0;padding:0;box-sizing:border-box}body{font-family:'DM Sans',sans-serif;background:${C.g50};color:${C.g700};-webkit-font-smoothing:antialiased}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-thumb{background:${C.g300};border-radius:3px}@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes si{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}@keyframes p{0%,100%{opacity:1}50%{opacity:.4}}.fi{animation:fi .25s ease forwards}.si{animation:si .2s ease forwards}`;

// ─── SEED ───
const S_USERS=[{id:"u1",name:"Issa Daouda",email:"issa@hissado.com",role:"admin",av:"ID",status:"active",dept:"Executive"},{id:"u2",name:"Sarah Mitchell",email:"sarah@hissado.com",role:"manager",av:"SM",status:"active",dept:"Engineering"},{id:"u3",name:"James Chen",email:"james@hissado.com",role:"member",av:"JC",status:"active",dept:"Engineering"},{id:"u4",name:"Amara Diallo",email:"amara@hissado.com",role:"member",av:"AD",status:"active",dept:"Design"},{id:"u5",name:"Client Portal",email:"client@external.com",role:"client",av:"CP",status:"active",dept:"External"}];
const S_PROJ=[{id:"p1",name:"Website Redesign",desc:"Complete redesign of corporate website",color:"#C8A45C",owner:"u2",members:["u1","u2","u3","u4"],status:"active",created:fmt(addD(now,-30))},{id:"p2",name:"Mobile App Launch",desc:"Native mobile app for iOS and Android",color:"#5B8DEF",owner:"u2",members:["u2","u3"],status:"active",created:fmt(addD(now,-20))},{id:"p3",name:"Q2 Marketing",desc:"Strategic marketing initiatives for Q2",color:"#6FCF97",owner:"u1",members:["u1","u4"],status:"active",created:fmt(addD(now,-15))},{id:"p4",name:"Data Migration",desc:"Legacy data migration to cloud",color:"#F2994A",owner:"u2",members:["u2","u3"],status:"on-hold",created:fmt(addD(now,-45))}];
const S_TASKS=[{id:"t1",pId:"p1",title:"Design system audit",desc:"Audit design tokens",status:"Done",pri:"High",assignee:"u4",due:fmt(addD(now,-5)),created:fmt(addD(now,-28)),subs:[{id:"s1",t:"Color review",done:true},{id:"s2",t:"Typography",done:true}],cmts:[{id:"c1",uid:"u4",text:"Completed audit. 23 inconsistencies found.",date:fmt(addD(now,-6))}],prog:100},{id:"t2",pId:"p1",title:"Wireframe homepage",desc:"Create wireframes",status:"In Review",pri:"High",assignee:"u4",due:fmt(addD(now,2)),created:fmt(addD(now,-20)),subs:[{id:"s3",t:"Desktop",done:true},{id:"s4",t:"Mobile",done:true},{id:"s5",t:"Tablet",done:false}],cmts:[],prog:75},{id:"t3",pId:"p1",title:"Frontend development",desc:"Implement new design in React",status:"In Progress",pri:"Medium",assignee:"u3",due:fmt(addD(now,10)),created:fmt(addD(now,-15)),subs:[{id:"s6",t:"Header",done:true},{id:"s7",t:"Hero",done:false}],cmts:[{id:"c2",uid:"u3",text:"Started component library setup.",date:fmt(addD(now,-3))}],prog:35},{id:"t4",pId:"p1",title:"SEO optimization",desc:"Implement SEO best practices",status:"To Do",pri:"Low",assignee:"u3",due:fmt(addD(now,20)),created:fmt(addD(now,-10)),subs:[],cmts:[],prog:0},{id:"t5",pId:"p1",title:"Content migration",desc:"Migrate content to new CMS",status:"To Do",pri:"Medium",assignee:"u2",due:fmt(addD(now,15)),created:fmt(addD(now,-8)),subs:[],cmts:[],prog:0},{id:"t6",pId:"p2",title:"API architecture",desc:"Design RESTful endpoints",status:"Done",pri:"Urgent",assignee:"u3",due:fmt(addD(now,-10)),created:fmt(addD(now,-18)),subs:[],cmts:[{id:"c3",uid:"u2",text:"Great API docs!",date:fmt(addD(now,-11))}],prog:100},{id:"t7",pId:"p2",title:"Auth module",desc:"OAuth 2.0 + JWT",status:"In Progress",pri:"Urgent",assignee:"u3",due:fmt(addD(now,3)),created:fmt(addD(now,-12)),subs:[{id:"s11",t:"Login flow",done:true},{id:"s12",t:"Token refresh",done:false}],cmts:[],prog:50},{id:"t8",pId:"p2",title:"Push notifications",desc:"Push notification service",status:"To Do",pri:"Medium",assignee:"u3",due:fmt(addD(now,25)),created:fmt(addD(now,-5)),subs:[],cmts:[],prog:0},{id:"t9",pId:"p3",title:"Campaign strategy",desc:"Q2 campaign strategy doc",status:"Done",pri:"High",assignee:"u1",due:fmt(addD(now,-7)),created:fmt(addD(now,-14)),subs:[],cmts:[],prog:100},{id:"t10",pId:"p3",title:"Social calendar",desc:"Q2 social media calendar",status:"In Progress",pri:"Medium",assignee:"u4",due:fmt(addD(now,5)),created:fmt(addD(now,-10)),subs:[{id:"s13",t:"April",done:true},{id:"s14",t:"May",done:false}],cmts:[],prog:33},{id:"t11",pId:"p3",title:"Email campaigns",desc:"Automated email sequences",status:"To Do",pri:"High",assignee:"u1",due:fmt(addD(now,12)),created:fmt(addD(now,-3)),subs:[],cmts:[],prog:0},{id:"t12",pId:"p4",title:"Data inventory",desc:"Catalog data sources",status:"In Progress",pri:"High",assignee:"u3",due:fmt(addD(now,8)),created:fmt(addD(now,-40)),subs:[{id:"s16",t:"DB schemas",done:true},{id:"s17",t:"File audit",done:false}],cmts:[],prog:45}];
const S_NOTIF=[{id:"n1",type:"assign",text:"Assigned to 'Frontend development'",read:false,date:fmt(addD(now,-1))},{id:"n2",type:"comment",text:"Amara commented on 'Design audit'",read:false,date:fmt(addD(now,-2))},{id:"n3",type:"due",text:"'Auth module' due in 3 days",read:true,date:fmt(now)}];
const S_CONVOS=[{id:"cv1",type:"direct",name:null,parts:["u1","u2"],created:addH(now,-48).toISOString()},{id:"cv2",type:"direct",name:null,parts:["u1","u3"],created:addH(now,-72).toISOString()},{id:"cv3",type:"group",name:"Website Redesign Team",parts:["u1","u2","u3","u4"],pId:"p1",created:addD(now,-25).toISOString()},{id:"cv4",type:"group",name:"Engineering",parts:["u1","u2","u3"],created:addD(now,-20).toISOString()},{id:"cv5",type:"group",name:"Design Team",parts:["u1","u4"],created:addD(now,-10).toISOString()}];
const S_MSGS=[{id:"m1",cId:"cv1",from:"u2",text:"Hey Issa, I pushed the updated wireframes. Can you review?",ts:addH(now,-26).toISOString()},{id:"m2",cId:"cv1",from:"u1",text:"Sure, I'll look this afternoon. Mobile breakpoints included?",ts:addH(now,-25).toISOString()},{id:"m3",cId:"cv1",from:"u2",text:"Yes, all three breakpoints covered. Also added dark mode.",ts:addH(now,-24).toISOString()},{id:"m4",cId:"cv1",from:"u1",text:"Perfect. Feedback by EOD.",ts:addH(now,-23).toISOString()},{id:"m5",cId:"cv2",from:"u3",text:"API endpoints ready for testing. Deploy to staging?",ts:addH(now,-10).toISOString()},{id:"m6",cId:"cv2",from:"u1",text:"Go ahead. Let me know when it's live.",ts:addH(now,-9).toISOString()},{id:"m7",cId:"cv3",from:"u2",text:"Team: On track for design review Friday. Components ready by Thursday EOD please.",ts:addH(now,-48).toISOString()},{id:"m8",cId:"cv3",from:"u4",text:"Icon set and illustrations finalized by Wednesday.",ts:addH(now,-46).toISOString()},{id:"m9",cId:"cv3",from:"u3",text:"Frontend at 60%. Header, nav, footer done. Working on hero.",ts:addH(now,-44).toISOString()},{id:"m10",cId:"cv3",from:"u1",text:"Great progress. Let's sync Thursday morning.",ts:addH(now,-42).toISOString()},{id:"m11",cId:"cv4",from:"u2",text:"Code reviews moving to Tuesdays next week.",ts:addH(now,-72).toISOString()},{id:"m12",cId:"cv5",from:"u4",text:"Uploaded new brand guidelines to shared files.",ts:addH(now,-5).toISOString()},{id:"m13",cId:"cv5",from:"u1",text:"Thanks Amara! Color palette looks refined. Let's apply everywhere.",ts:addH(now,-4).toISOString()}];
const S_FILES=[{id:"f1",name:"Brand Guidelines v2.pdf",type:"pdf",size:"2.4 MB",pId:"p1",fId:"fl1",by:"u4",at:addD(now,-20).toISOString(),tags:["design","branding"]},{id:"f2",name:"Homepage Wireframe.fig",type:"fig",size:"8.1 MB",pId:"p1",fId:"fl1",by:"u4",at:addD(now,-15).toISOString(),tags:["wireframe"]},{id:"f3",name:"Component Library.fig",type:"fig",size:"12.3 MB",pId:"p1",fId:"fl1",by:"u4",at:addD(now,-10).toISOString(),tags:["components"]},{id:"f4",name:"SEO Audit.pdf",type:"pdf",size:"1.8 MB",pId:"p1",fId:"fl2",by:"u3",at:addD(now,-8).toISOString(),tags:["seo"]},{id:"f5",name:"Content Inventory.xls",type:"xls",size:"340 KB",pId:"p1",fId:"fl2",by:"u2",at:addD(now,-5).toISOString(),tags:["content"]},{id:"f6",name:"API Docs.md",type:"md",size:"45 KB",pId:"p2",fId:"fl3",by:"u3",at:addD(now,-12).toISOString(),tags:["api"]},{id:"f7",name:"DB Schema.pdf",type:"pdf",size:"890 KB",pId:"p2",fId:"fl3",by:"u3",at:addD(now,-10).toISOString(),tags:["database"]},{id:"f8",name:"App Mockups.fig",type:"fig",size:"15.2 MB",pId:"p2",fId:"fl4",by:"u4",at:addD(now,-8).toISOString(),tags:["mobile"]},{id:"f9",name:"Q2 Strategy.pptx",type:"pptx",size:"4.5 MB",pId:"p3",fId:"fl5",by:"u1",at:addD(now,-7).toISOString(),tags:["strategy"]},{id:"f10",name:"Social Calendar.xls",type:"xls",size:"210 KB",pId:"p3",fId:"fl5",by:"u4",at:addD(now,-4).toISOString(),tags:["social"]},{id:"f11",name:"Migration Plan.pdf",type:"pdf",size:"780 KB",pId:"p4",fId:"fl6",by:"u2",at:addD(now,-25).toISOString(),tags:["migration"]}];
const S_FLDRS=[{id:"fl1",name:"Design Assets",pId:"p1"},{id:"fl2",name:"Documents",pId:"p1"},{id:"fl3",name:"Technical Docs",pId:"p2"},{id:"fl4",name:"Design",pId:"p2"},{id:"fl5",name:"Campaign Materials",pId:"p3"},{id:"fl6",name:"Migration Docs",pId:"p4"}];


// ─── UI PRIMITIVES ───
function Av({ini,size=32,color=C.gold}){return <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${color},${C.goldD})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:size*.38,fontWeight:600,flexShrink:0}}>{ini}</div>;}
function Bdg({children,v="default",style={}}){const m={default:{bg:C.g200,c:C.g600},gold:{bg:`${C.gold}18`,c:C.goldD},success:{bg:"#D1FAE5",c:"#065F46"},warning:{bg:"#FEF3C7",c:"#92400E"},danger:{bg:"#FEE2E2",c:"#991B1B"},info:{bg:"#DBEAFE",c:"#1E40AF"}}[v]||{bg:C.g200,c:C.g600};return <span style={{display:"inline-flex",alignItems:"center",padding:"2px 10px",borderRadius:12,fontSize:11,fontWeight:600,background:m.bg,color:m.c,letterSpacing:".03em",textTransform:"uppercase",...style}}>{children}</span>;}
function Btn({children,v="primary",sz="md",onClick,style={},disabled,icon}){const b={border:"none",cursor:disabled?"not-allowed":"pointer",borderRadius:8,fontFamily:"inherit",fontWeight:600,display:"inline-flex",alignItems:"center",gap:6,transition:"all .15s",opacity:disabled?.5:1};const s={sm:{padding:"6px 12px",fontSize:12},md:{padding:"8px 18px",fontSize:13},lg:{padding:"12px 24px",fontSize:14}};const vr={primary:{background:`linear-gradient(135deg,${C.gold},${C.goldD})`,color:"#fff",boxShadow:"0 2px 8px rgba(200,164,92,.3)"},secondary:{background:C.w,color:C.g700,border:`1px solid ${C.g200}`},ghost:{background:"transparent",color:C.g500},danger:{background:"#FEE2E2",color:"#DC2626"},navy:{background:C.navy,color:"#fff"}};return <button onClick={onClick} disabled={disabled} style={{...b,...s[sz],...vr[v],...style}}>{icon&&<span style={{display:"flex"}}>{icon}</span>}{children}</button>;}
function Inp({label,value,onChange,type="text",ph,style={},ta,opts}){const is={width:"100%",padding:"10px 14px",border:`1px solid ${C.g200}`,borderRadius:8,fontSize:13,fontFamily:"inherit",color:C.g700,background:C.w,outline:"none",...style};return <div style={{marginBottom:16}}>{label&&<label style={{display:"block",fontSize:12,fontWeight:600,color:C.g500,marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>{label}</label>}{opts?<select value={value} onChange={e=>onChange(e.target.value)} style={{...is,cursor:"pointer"}}>{opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select>:ta?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={ph} rows={3} style={{...is,resize:"vertical"}}/>:<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={ph} style={is} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.g200}/>}</div>;}
function Modal({open,onClose,title,children,w=520}){if(!open)return null;return <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}><div style={{position:"fixed",inset:0,background:"rgba(15,26,46,.6)",backdropFilter:"blur(4px)"}}/><div className="si" onClick={e=>e.stopPropagation()} style={{background:C.w,borderRadius:16,width:"100%",maxWidth:w,maxHeight:"85vh",overflow:"auto",position:"relative",boxShadow:"0 25px 60px rgba(0,0,0,.2)"}}><div style={{padding:"20px 24px",borderBottom:`1px solid ${C.g100}`,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:C.w,zIndex:1,borderRadius:"16px 16px 0 0"}}><h3 style={{fontSize:16,fontWeight:700,color:C.navy}}>{title}</h3><button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:C.g400,display:"flex"}}>{I.x}</button></div><div style={{padding:24}}>{children}</div></div></div>;}
function Empty({icon,title,desc,action}){return <div style={{textAlign:"center",padding:"60px 20px"}}><div style={{width:64,height:64,borderRadius:16,background:`${C.gold}12`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",color:C.gold}}>{icon}</div><h3 style={{fontSize:16,fontWeight:600,color:C.navy,marginBottom:8}}>{title}</h3><p style={{fontSize:13,color:C.g400,maxWidth:320,margin:"0 auto 20px"}}>{desc}</p>{action}</div>;}
function PBar({value,h=6,color=C.gold}){return <div style={{height:h,borderRadius:h,background:C.g100,overflow:"hidden",width:"100%"}}><div style={{height:"100%",width:`${Math.min(100,value)}%`,borderRadius:h,background:`linear-gradient(90deg,${color},${C.goldL})`,transition:"width .4s"}}/></div>;}
function Tabs({tabs,active,onChange}){return <div style={{display:"flex",gap:2,background:C.g100,borderRadius:10,padding:3}}>{tabs.map(t=><button key={t.k} onClick={()=>onChange(t.k)} style={{padding:"7px 16px",border:"none",borderRadius:8,fontSize:12,fontWeight:600,fontFamily:"inherit",cursor:"pointer",transition:"all .15s",background:active===t.k?C.w:"transparent",color:active===t.k?C.navy:C.g400,boxShadow:active===t.k?"0 1px 4px rgba(0,0,0,.08)":"none",display:"flex",alignItems:"center",gap:6}}>{t.icon} {t.l}</button>)}</div>;}
function Logo(){return <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:24,height:24,background:`linear-gradient(135deg,${C.gold},${C.goldD})`,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:14.4,lineHeight:1}}>H</span></div><div><div style={{fontSize:14,fontWeight:700,color:C.w,letterSpacing:".08em",lineHeight:1}}>HISSADO</div><div style={{fontSize:7.7,fontWeight:500,color:C.goldL,letterSpacing:".2em",textTransform:"uppercase",marginTop:1}}>PROJECT</div></div></div>;}
function FileIcon({type,size=40}){const ft=FT[type]||{c:C.g400,l:type?.toUpperCase()||"FILE"};return <div style={{width:size,height:size*1.2,borderRadius:6,background:`${ft.c}12`,border:`1px solid ${ft.c}25`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:size*.25,fontWeight:800,color:ft.c,textTransform:"uppercase"}}>{ft.l}</span></div>;}


// ─── SIDEBAR ───
function Side({pg,setPg,projs,col,setCol,user,unread}){
  const nav=[{k:"dashboard",i:I.home,l:"Dashboard"},{k:"projects",i:I.folder,l:"Projects"},{k:"tasks",i:I.check,l:"My Tasks"},{k:"chat",i:I.chat,l:"Messages",b:unread},{k:"files",i:I.file,l:"Files"},{k:"calendar",i:I.cal,l:"Calendar"},{k:"reports",i:I.chart,l:"Reports"},{k:"team",i:I.users,l:"Team"}];
  const adm=user?.role==="admin"||user?.role==="manager";
  return <aside style={{width:col?64:260,minHeight:"100vh",background:`linear-gradient(180deg,${C.navy} 0%,${C.navyL} 100%)`,display:"flex",flexDirection:"column",transition:"width .25s",flexShrink:0,borderRight:"1px solid rgba(255,255,255,.06)"}}>
    <div style={{padding:col?"20px 12px":"20px 20px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:col?"center":"space-between",minHeight:68}}>{!col&&<Logo/>}<button onClick={()=>setCol(!col)} style={{background:"rgba(255,255,255,.06)",border:"none",borderRadius:8,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.g400,flexShrink:0}}>{col?I.chR:I.chL}</button></div>
    <nav style={{padding:col?"12px 8px":"12px",flex:1}}>
      {nav.map(n=><button key={n.k} onClick={()=>setPg(n.k)} style={{width:"100%",padding:col?"10px":"10px 14px",border:"none",borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",gap:12,justifyContent:col?"center":"flex-start",background:pg===n.k?"rgba(200,164,92,.12)":"transparent",color:pg===n.k?C.gold:"rgba(255,255,255,.5)",fontSize:13,fontWeight:pg===n.k?600:400,fontFamily:"inherit",transition:"all .15s",marginBottom:2,position:"relative"}}>
        {pg===n.k&&<div style={{position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",width:3,height:20,borderRadius:2,background:C.gold}}/>}
        <span style={{position:"relative",display:"flex"}}>{n.i}{n.b>0&&<span style={{position:"absolute",top:-4,right:-6,width:14,height:14,borderRadius:"50%",background:C.err,color:"#fff",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{n.b}</span>}</span>
        {!col&&<span>{n.l}</span>}
      </button>)}
      {!col&&projs.filter(p=>p.status==="active").length>0&&<div style={{marginTop:24,paddingTop:16,borderTop:"1px solid rgba(255,255,255,.06)"}}>
        <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.25)",letterSpacing:".12em",textTransform:"uppercase",padding:"0 14px",marginBottom:10}}>Projects</div>
        {projs.filter(p=>p.status==="active").map(p=><button key={p.id} onClick={()=>setPg("pdetail")} style={{width:"100%",padding:"8px 14px",border:"none",borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",gap:10,background:"transparent",color:"rgba(255,255,255,.45)",fontSize:12,fontFamily:"inherit",textAlign:"left"}}><div style={{width:8,height:8,borderRadius:"50%",background:p.color,flexShrink:0}}/><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span></button>)}
      </div>}
      {adm&&<div style={{marginTop:24,paddingTop:16,borderTop:"1px solid rgba(255,255,255,.06)"}}><button onClick={()=>setPg("settings")} style={{width:"100%",padding:col?"10px":"10px 14px",border:"none",borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",gap:12,justifyContent:col?"center":"flex-start",background:pg==="settings"?"rgba(200,164,92,.12)":"transparent",color:pg==="settings"?C.gold:"rgba(255,255,255,.5)",fontSize:13,fontWeight:pg==="settings"?600:400,fontFamily:"inherit"}}>{I.gear}{!col&&<span>Settings</span>}</button></div>}
    </nav>
    {!col&&<div style={{padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,.06)"}}><div style={{display:"flex",alignItems:"center",gap:10}}><Av ini={user?.av} size={34}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:C.w,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.name}</div><div style={{fontSize:11,color:"rgba(255,255,255,.35)",textTransform:"capitalize"}}>{user?.role}</div></div></div></div>}
  </aside>;
}

// ─── HEADER ───
function Hdr({title,sub,notifs,onN,sq,setSq}){const ur=notifs.filter(n=>!n.read).length;return <header style={{padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,borderBottom:`1px solid ${C.g100}`,background:C.w,position:"sticky",top:0,zIndex:50}}><div><h1 style={{fontSize:20,fontWeight:700,color:C.navy,fontFamily:"'Playfair Display',serif"}}>{title}</h1>{sub&&<p style={{fontSize:12,color:C.g400,marginTop:2}}>{sub}</p>}</div><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{position:"relative"}}><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:C.g300,display:"flex"}}>{I.search}</span><input value={sq} onChange={e=>setSq(e.target.value)} placeholder="Search..." style={{width:220,padding:"8px 12px 8px 34px",border:`1px solid ${C.g200}`,borderRadius:10,fontSize:13,fontFamily:"inherit",color:C.g700,background:C.g50,outline:"none"}}/></div><button onClick={onN} style={{position:"relative",background:"none",border:"none",cursor:"pointer",color:C.g400,padding:6,borderRadius:8}}>{I.bell}{ur>0&&<span style={{position:"absolute",top:2,right:2,width:16,height:16,borderRadius:"50%",background:C.err,color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{ur}</span>}</button></div></header>;}

// ─── DASHBOARD ───
function Dash({projs,tasks,users}){const tt=tasks.length;const dn=tasks.filter(t=>t.status==="Done").length;const ip=tasks.filter(t=>t.status==="In Progress").length;const od=tasks.filter(t=>t.status!=="Done"&&new Date(t.due)<now).length;
  return <div className="fi" style={{padding:28}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:28}}>
      {[{l:"Total Tasks",v:tt,c:C.info},{l:"Completed",v:dn,c:C.ok},{l:"In Progress",v:ip,c:C.warn},{l:"Overdue",v:od,c:C.err}].map((s,i)=><div key={i} style={{background:C.w,borderRadius:14,padding:"20px 22px",border:`1px solid ${C.g100}`,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:-10,right:-10,width:60,height:60,borderRadius:"50%",background:`${s.c}08`}}/><span style={{fontSize:12,fontWeight:600,color:C.g400,textTransform:"uppercase",letterSpacing:".05em"}}>{s.l}</span><div style={{fontSize:28,fontWeight:700,color:C.navy,fontFamily:"'Playfair Display',serif",marginTop:8}}>{s.v}</div></div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
      <div style={{background:C.w,borderRadius:14,border:`1px solid ${C.g100}`}}><div style={{padding:"18px 22px",borderBottom:`1px solid ${C.g100}`}}><h3 style={{fontSize:14,fontWeight:700,color:C.navy}}>Project Progress</h3></div><div style={{padding:"8px 22px 18px"}}>{projs.map(p=>{const pt=tasks.filter(t=>t.pId===p.id);const d=pt.filter(t=>t.status==="Done").length;const pct=pt.length?Math.round(d/pt.length*100):0;return <div key={p.id} style={{padding:"14px 0",borderBottom:`1px solid ${C.g50}`}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:10,height:10,borderRadius:"50%",background:p.color}}/><span style={{fontSize:13,fontWeight:600,color:C.g700}}>{p.name}</span></div><span style={{fontSize:12,fontWeight:700,color:C.navy}}>{pct}%</span></div><PBar value={pct} color={p.color}/></div>;})}</div></div>
      <div style={{background:C.w,borderRadius:14,border:`1px solid ${C.g100}`}}><div style={{padding:"18px 22px",borderBottom:`1px solid ${C.g100}`}}><h3 style={{fontSize:14,fontWeight:700,color:C.navy}}>Team Workload</h3></div><div style={{padding:"8px 22px 18px"}}>{users.filter(u=>u.role!=="client").map(u=>{const ut=tasks.filter(t=>t.assignee===u.id&&t.status!=="Done");return <div key={u.id} style={{padding:"12px 0",borderBottom:`1px solid ${C.g50}`,display:"flex",alignItems:"center",gap:12}}><Av ini={u.av} size={34}/><div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:13,fontWeight:600,color:C.g700}}>{u.name}</span><span style={{fontSize:11,color:C.g400}}>{ut.length} active</span></div><PBar value={(ut.length/8)*100} h={5} color={ut.length>5?C.err:ut.length>3?C.warn:C.ok}/></div></div>;})}</div></div>
    </div>
    <div style={{marginTop:20,background:C.w,borderRadius:14,border:`1px solid ${C.g100}`}}><div style={{padding:"18px 22px",borderBottom:`1px solid ${C.g100}`}}><h3 style={{fontSize:14,fontWeight:700,color:C.navy}}>Upcoming & Overdue</h3></div><div style={{padding:"4px 12px 12px"}}>{tasks.filter(t=>t.status!=="Done"&&new Date(t.due)<=addD(now,7)).sort((a,b)=>new Date(a.due)-new Date(b.due)).slice(0,8).map(t=>{const pr=projs.find(p=>p.id===t.pId);const isOd=new Date(t.due)<now;return <div key={t.id} style={{padding:10,display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${C.g50}`}}><div style={{width:6,height:6,borderRadius:"50%",background:isOd?C.err:PC[t.pri]?.d}}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:C.g700}}>{t.title}</div><div style={{fontSize:11,color:C.g400}}>{pr?.name}</div></div><span style={{fontSize:11,color:isOd?C.err:C.g400}}>{t.due}</span>{isOd&&<Bdg v="danger" style={{fontSize:9}}>OVERDUE</Bdg>}</div>;})}</div></div>
  </div>;
}

// ─── TASK CARD ───
function TCard({task,proj,users,onClick,compact}){const a=users.find(u=>u.id===task.assignee);const pc=PC[task.pri];const od=task.status!=="Done"&&new Date(task.due)<now;return <div onClick={onClick} style={{background:C.w,borderRadius:12,padding:compact?"12px 14px":"16px 18px",border:`1px solid ${C.g100}`,cursor:"pointer",transition:"all .15s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.gold+"40";e.currentTarget.style.boxShadow="0 4px 12px rgba(200,164,92,.1)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.g100;e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,.04)";}}>
  <div style={{display:"flex",gap:6,marginBottom:8}}><span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:6,background:pc.bg,color:pc.t}}>{task.pri}</span>{od&&<span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:6,background:"#FEE2E2",color:"#DC2626"}}>OVERDUE</span>}</div>
  <h4 style={{fontSize:13,fontWeight:600,color:C.navy,marginBottom:6}}>{task.title}</h4>
  {task.subs?.length>0&&<div style={{marginBottom:8}}><PBar value={(task.subs.filter(s=>s.done).length/task.subs.length)*100} h={4}/><span style={{fontSize:10,color:C.g400,marginTop:3,display:"block"}}>{task.subs.filter(s=>s.done).length}/{task.subs.length} subtasks</span></div>}
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:8}}>{a&&<Av ini={a.av} size={22}/>}<span style={{fontSize:11,color:od?C.err:C.g400,display:"flex",alignItems:"center",gap:3}}>{I.clock} {task.due}</span></div>{task.cmts?.length>0&&<span style={{fontSize:11,color:C.g400,display:"flex",alignItems:"center",gap:2}}>{I.msg} {task.cmts.length}</span>}</div>
</div>;}


// ─── TASK DETAIL ───
function TDetail({open,task,onClose,onUpdate,projs,users}){const[et,setEt]=useState(null);const[nc,setNc]=useState("");const[ns,setNs]=useState("");useEffect(()=>{if(task)setEt({...task});},[task]);if(!open||!et)return null;const sv=()=>{onUpdate(et);onClose();};
return <Modal open={open} onClose={sv} title={et.title} w={640}><div style={{display:"grid",gridTemplateColumns:"1fr 180px",gap:24}}><div>
  <Inp label="Title" value={et.title} onChange={v=>setEt({...et,title:v})}/>
  <Inp label="Description" value={et.desc||""} onChange={v=>setEt({...et,desc:v})} ta/>
  <div style={{marginBottom:16}}><label style={{display:"block",fontSize:12,fontWeight:600,color:C.g500,marginBottom:8,textTransform:"uppercase",letterSpacing:".05em"}}>Subtasks</label>
    {et.subs?.map(st=><div key={st.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0"}}><input type="checkbox" checked={st.done} onChange={()=>setEt({...et,subs:et.subs.map(s=>s.id===st.id?{...s,done:!s.done}:s)})} style={{accentColor:C.gold}}/><span style={{fontSize:13,color:st.done?C.g400:C.g700,textDecoration:st.done?"line-through":"none"}}>{st.t}</span></div>)}
    <div style={{display:"flex",gap:8,marginTop:6}}><input value={ns} onChange={e=>setNs(e.target.value)} placeholder="Add subtask..." onKeyDown={e=>{if(e.key==="Enter"&&ns.trim()){setEt({...et,subs:[...(et.subs||[]),{id:uid(),t:ns,done:false}]});setNs("");}}} style={{flex:1,padding:"6px 10px",border:`1px solid ${C.g200}`,borderRadius:6,fontSize:12,fontFamily:"inherit",outline:"none"}}/><Btn sz="sm" v="secondary" onClick={()=>{if(ns.trim()){setEt({...et,subs:[...(et.subs||[]),{id:uid(),t:ns,done:false}]});setNs("");}}} icon={I.plus}>Add</Btn></div>
  </div>
  <div><label style={{display:"block",fontSize:12,fontWeight:600,color:C.g500,marginBottom:8,textTransform:"uppercase",letterSpacing:".05em"}}>Comments</label>
    {et.cmts?.map(c=>{const cu=users.find(u=>u.id===c.uid);return <div key={c.id} style={{display:"flex",gap:8,marginBottom:10,padding:"10px 12px",background:C.g50,borderRadius:10}}><Av ini={cu?.av||"?"} size={24}/><div><div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}><span style={{fontSize:12,fontWeight:600,color:C.g700}}>{cu?.name}</span><span style={{fontSize:10,color:C.g400}}>{c.date}</span></div><p style={{fontSize:13,color:C.g600,lineHeight:1.5}}>{c.text}</p></div></div>;})}
    <div style={{display:"flex",gap:8}}><input value={nc} onChange={e=>setNc(e.target.value)} placeholder="Add comment..." onKeyDown={e=>{if(e.key==="Enter"&&nc.trim()){setEt({...et,cmts:[...(et.cmts||[]),{id:uid(),uid:"u1",text:nc,date:fmt(now)}]});setNc("");}}} style={{flex:1,padding:"8px 12px",border:`1px solid ${C.g200}`,borderRadius:8,fontSize:13,fontFamily:"inherit",outline:"none"}}/><Btn sz="sm" onClick={()=>{if(nc.trim()){setEt({...et,cmts:[...(et.cmts||[]),{id:uid(),uid:"u1",text:nc,date:fmt(now)}]});setNc("");}}}>Post</Btn></div>
  </div>
</div><div>
  <Inp label="Status" value={et.status} onChange={v=>setEt({...et,status:v,prog:v==="Done"?100:et.prog})} opts={STS.map(s=>({v:s,l:s}))}/>
  <Inp label="Priority" value={et.pri} onChange={v=>setEt({...et,pri:v})} opts={PRI.map(p=>({v:p,l:p}))}/>
  <Inp label="Assignee" value={et.assignee} onChange={v=>setEt({...et,assignee:v})} opts={users.map(u=>({v:u.id,l:u.name}))}/>
  <Inp label="Due Date" value={et.due} onChange={v=>setEt({...et,due:v})} type="date"/>
</div></div><div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:20,paddingTop:16,borderTop:`1px solid ${C.g100}`}}><Btn v="secondary" onClick={onClose}>Cancel</Btn><Btn onClick={sv}>Save</Btn></div></Modal>;}

// ─── KANBAN ───
function Kanban({tasks,projs,users,onTC}){return <div style={{display:"grid",gridTemplateColumns:`repeat(${STS.length},1fr)`,gap:16,minHeight:400}}>{STS.map(st=>{const col=SC[st];const ct=tasks.filter(t=>t.status===st);return <div key={st} style={{background:C.g50,borderRadius:14}}><div style={{padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:"50%",background:col.a}}/><span style={{fontSize:13,fontWeight:700,color:C.navy}}>{st}</span></div><span style={{fontSize:11,fontWeight:600,color:C.g400,background:C.w,padding:"2px 8px",borderRadius:10}}>{ct.length}</span></div><div style={{padding:"0 8px 12px",display:"flex",flexDirection:"column",gap:8}}>{ct.map(t=><TCard key={t.id} task={t} proj={projs.find(p=>p.id===t.pId)} users={users} onClick={()=>onTC(t)} compact/>)}</div></div>;})}</div>;}

// ─── LIST VIEW ───
function LView({tasks,projs,users,onTC}){return <div style={{background:C.w,borderRadius:14,border:`1px solid ${C.g100}`,overflow:"hidden"}}><div style={{display:"grid",gridTemplateColumns:"2fr 1fr 100px 100px 120px 80px",padding:"12px 20px",background:C.g50,borderBottom:`1px solid ${C.g100}`,gap:12}}>{["Task","Project","Status","Priority","Due","Assignee"].map(h=><span key={h} style={{fontSize:10,fontWeight:700,color:C.g400,textTransform:"uppercase",letterSpacing:".08em"}}>{h}</span>)}</div>{tasks.map(t=>{const pr=projs.find(p=>p.id===t.pId);const u=users.find(x=>x.id===t.assignee);const sc=SC[t.status];const pc=PC[t.pri];const od=t.status!=="Done"&&new Date(t.due)<now;return <div key={t.id} onClick={()=>onTC(t)} style={{display:"grid",gridTemplateColumns:"2fr 1fr 100px 100px 120px 80px",padding:"14px 20px",borderBottom:`1px solid ${C.g50}`,cursor:"pointer",gap:12,alignItems:"center",transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background=C.g50} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><div style={{fontSize:13,fontWeight:500,color:C.navy}}>{t.title}</div><div style={{display:"flex",alignItems:"center",gap:6}}>{pr&&<><div style={{width:6,height:6,borderRadius:"50%",background:pr.color}}/><span style={{fontSize:12,color:C.g500}}>{pr.name}</span></>}</div><span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:8,background:sc.bg,color:sc.t,textAlign:"center"}}>{t.status}</span><span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:8,background:pc.bg,color:pc.t,textAlign:"center"}}>{t.pri}</span><span style={{fontSize:12,color:od?C.err:C.g500,fontWeight:od?600:400}}>{t.due}</span><div style={{display:"flex",justifyContent:"center"}}>{u&&<Av ini={u.av} size={26}/>}</div></div>;})}</div>;}

// ─── CALENDAR ───
function CalView({tasks,projs,users,onTC}){const[mo,setMo]=useState(0);const md=new Date(now.getFullYear(),now.getMonth()+mo,1);const dim=new Date(md.getFullYear(),md.getMonth()+1,0).getDate();const fd=md.getDay();const mn=md.toLocaleString("default",{month:"long",year:"numeric"});const cells=[];for(let i=0;i<fd;i++)cells.push(null);for(let d=1;d<=dim;d++)cells.push(d);
return <div className="fi"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><Btn v="secondary" sz="sm" onClick={()=>setMo(o=>o-1)}>← Prev</Btn><h3 style={{fontSize:16,fontWeight:700,color:C.navy,fontFamily:"'Playfair Display',serif"}}>{mn}</h3><Btn v="secondary" sz="sm" onClick={()=>setMo(o=>o+1)}>Next →</Btn></div><div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,background:C.g200,borderRadius:12,overflow:"hidden"}}>{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} style={{padding:"10px 8px",textAlign:"center",fontSize:11,fontWeight:700,color:C.g400,background:C.g50,textTransform:"uppercase"}}>{d}</div>)}{cells.map((day,i)=>{if(!day)return <div key={`e${i}`} style={{background:C.w,minHeight:90,padding:6}}/>;const ds=`${md.getFullYear()}-${String(md.getMonth()+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;const dt=tasks.filter(t=>t.due===ds);const isT=ds===fmt(now);return <div key={i} style={{background:C.w,minHeight:90,padding:6}}><span style={{fontSize:12,fontWeight:isT?700:400,display:"inline-flex",width:24,height:24,borderRadius:"50%",alignItems:"center",justifyContent:"center",background:isT?C.gold:"transparent",color:isT?"#fff":C.g500}}>{day}</span>{dt.slice(0,3).map(t=>{const pr=projs.find(p=>p.id===t.pId);return <div key={t.id} onClick={()=>onTC(t)} style={{fontSize:10,padding:"2px 5px",borderRadius:4,marginBottom:2,cursor:"pointer",background:`${pr?.color||C.g300}18`,color:pr?.color||C.g600,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</div>;})}{dt.length>3&&<span style={{fontSize:9,color:C.g400}}>+{dt.length-3}</span>}</div>;})}</div></div>;}

// ─── PROJECTS PAGE ───
function ProjsPage({projs,tasks,users,onAdd,setSelP,setPg}){return <div className="fi" style={{padding:28}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><div><h2 style={{fontSize:18,fontWeight:700,color:C.navy,fontFamily:"'Playfair Display',serif"}}>All Projects</h2><p style={{fontSize:13,color:C.g400,marginTop:4}}>{projs.length} projects</p></div><Btn onClick={onAdd} icon={I.plus}>New Project</Btn></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:16}}>{projs.map((p,i)=>{const pt=tasks.filter(t=>t.pId===p.id);const d=pt.filter(t=>t.status==="Done").length;const pct=pt.length?Math.round(d/pt.length*100):0;return <div key={p.id} className="fi" style={{animationDelay:`${i*.05}s`,background:C.w,borderRadius:14,border:`1px solid ${C.g100}`,overflow:"hidden",cursor:"pointer",transition:"all .15s"}} onClick={()=>{setSelP(p);setPg("pdetail");}} onMouseEnter={e=>{e.currentTarget.style.borderColor=p.color+"60";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,.08)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.g100;e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}><div style={{height:4,background:`linear-gradient(90deg,${p.color},${p.color}80)`}}/><div style={{padding:"20px 22px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><h3 style={{fontSize:15,fontWeight:700,color:C.navy}}>{p.name}</h3><Bdg v={p.status==="active"?"success":"warning"}>{p.status}</Bdg></div><p style={{fontSize:12,color:C.g400,marginBottom:16,lineHeight:1.6}}>{p.desc}</p><div style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:11,color:C.g400}}>{d}/{pt.length} complete</span><span style={{fontSize:11,fontWeight:700,color:C.navy}}>{pct}%</span></div><PBar value={pct} color={p.color}/></div><div style={{display:"flex"}}>{p.members.slice(0,4).map((mId,mi)=>{const m=users.find(u=>u.id===mId);return m?<div key={mId} style={{marginLeft:mi>0?-6:0,zIndex:4-mi}}><Av ini={m.av} size={26}/></div>:null;})}</div></div></div>;})}</div></div>;}

// ─── PROJECT DETAIL ───
function PDetail({proj,tasks,users,projs,onTC,onAT,setPg}){const[vw,setVw]=useState("board");if(!proj)return <Empty icon={I.folder} title="No project" desc="Select a project" action={<Btn onClick={()=>setPg("projects")}>Browse</Btn>}/>;const pt=tasks.filter(t=>t.pId===proj.id);const d=pt.filter(t=>t.status==="Done").length;const pct=pt.length?Math.round(d/pt.length*100):0;const vt=[{k:"board",l:"Board",icon:I.board},{k:"list",l:"List",icon:I.list},{k:"calendar",l:"Calendar",icon:I.cal}];
return <div className="fi" style={{padding:28}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20,fontSize:12,color:C.g400}}><span style={{cursor:"pointer"}} onClick={()=>setPg("projects")}>Projects</span>{I.chR}<span style={{color:C.navy,fontWeight:600}}>{proj.name}</span></div><div style={{background:C.w,borderRadius:14,border:`1px solid ${C.g100}`,padding:"20px 24px",marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:14,height:14,borderRadius:"50%",background:proj.color}}/><h2 style={{fontSize:20,fontWeight:700,color:C.navy,fontFamily:"'Playfair Display',serif"}}>{proj.name}</h2><Bdg v={proj.status==="active"?"success":"warning"}>{proj.status}</Bdg></div><Btn onClick={onAT} icon={I.plus}>Add Task</Btn></div><p style={{fontSize:13,color:C.g400,marginBottom:16}}>{proj.desc}</p><div style={{display:"flex",gap:24,alignItems:"center"}}><div style={{flex:1,maxWidth:300}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:C.g400}}>Progress</span><span style={{fontSize:12,fontWeight:700,color:C.navy}}>{pct}%</span></div><PBar value={pct} color={proj.color}/></div><div style={{display:"flex",gap:16}}>{[{l:"Total",v:pt.length},{l:"Done",v:d},{l:"Active",v:pt.filter(t=>t.status==="In Progress").length},{l:"Overdue",v:pt.filter(t=>t.status!=="Done"&&new Date(t.due)<now).length}].map(s=><div key={s.l} style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,color:C.navy}}>{s.v}</div><div style={{fontSize:10,color:C.g400,textTransform:"uppercase"}}>{s.l}</div></div>)}</div></div></div><div style={{marginBottom:16}}><Tabs tabs={vt} active={vw} onChange={setVw}/></div>{vw==="board"&&<Kanban tasks={pt} projs={projs} users={users} onTC={onTC}/>}{vw==="list"&&<LView tasks={pt} projs={projs} users={users} onTC={onTC}/>}{vw==="calendar"&&<CalView tasks={pt} projs={projs} users={users} onTC={onTC}/>}</div>;}

// ─── MY TASKS ───
function MyTasks({tasks,projs,users,onTC,onAT}){const[vw,setVw]=useState("board");const[fl,setFl]=useState("all");const mt=tasks.filter(t=>t.assignee==="u1");const ft=fl==="all"?mt:mt.filter(t=>t.status===fl);const vt=[{k:"board",l:"Board",icon:I.board},{k:"list",l:"List",icon:I.list},{k:"calendar",l:"Calendar",icon:I.cal}];
return <div className="fi" style={{padding:28}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><div><h2 style={{fontSize:18,fontWeight:700,color:C.navy,fontFamily:"'Playfair Display',serif"}}>My Tasks</h2><p style={{fontSize:13,color:C.g400,marginTop:4}}>{mt.length} assigned</p></div><Btn onClick={onAT} icon={I.plus}>New Task</Btn></div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,gap:12}}><Tabs tabs={vt} active={vw} onChange={setVw}/><div style={{display:"flex",gap:4,background:C.g100,borderRadius:8,padding:2}}>{["all",...STS].map(s=><button key={s} onClick={()=>setFl(s)} style={{padding:"5px 12px",border:"none",borderRadius:6,fontSize:11,fontWeight:600,fontFamily:"inherit",cursor:"pointer",background:fl===s?C.w:"transparent",color:fl===s?C.navy:C.g400,boxShadow:fl===s?"0 1px 3px rgba(0,0,0,.06)":"none"}}>{s==="all"?"All":s}</button>)}</div></div>{ft.length===0?<Empty icon={I.check} title="No tasks" desc="Create a task or change filter"/>:<>{vw==="board"&&<Kanban tasks={ft} projs={projs} users={users} onTC={onTC}/>}{vw==="list"&&<LView tasks={ft} projs={projs} users={users} onTC={onTC}/>}{vw==="calendar"&&<CalView tasks={ft} projs={projs} users={users} onTC={onTC}/>}</>}</div>;}

// ─── REPORTS ───
function Reports({projs,tasks,users}){const tt=tasks.length;const c=tasks.filter(t=>t.status==="Done").length;const cr=tt?Math.round(c/tt*100):0;const od=tasks.filter(t=>t.status!=="Done"&&new Date(t.due)<now).length;const sd=STS.map(s=>({s,c:tasks.filter(t=>t.status===s).length,color:SC[s].a}));const mc=Math.max(...sd.map(s=>s.c),1);
return <div className="fi" style={{padding:28}}><h2 style={{fontSize:18,fontWeight:700,color:C.navy,fontFamily:"'Playfair Display',serif",marginBottom:24}}>Reports & Analytics</h2><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>{[{l:"Completion",v:`${cr}%`},{l:"On-Time",v:`${tt?Math.round((tt-od)/tt*100):100}%`},{l:"Projects",v:projs.filter(p=>p.status==="active").length},{l:"Avg/Person",v:(tt/Math.max(users.filter(u=>u.role!=="client").length,1)).toFixed(1)}].map((k,i)=><div key={i} style={{background:C.w,borderRadius:14,padding:"20px 22px",border:`1px solid ${C.g100}`}}><div style={{fontSize:11,fontWeight:600,color:C.g400,textTransform:"uppercase",letterSpacing:".05em",marginBottom:8}}>{k.l}</div><div style={{fontSize:28,fontWeight:700,color:C.navy,fontFamily:"'Playfair Display',serif"}}>{k.v}</div></div>)}</div><div style={{background:C.w,borderRadius:14,border:`1px solid ${C.g100}`,padding:"22px 24px"}}><h3 style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:20}}>Status Distribution</h3><div style={{display:"flex",gap:12,alignItems:"flex-end",height:160}}>{sd.map(s=><div key={s.s} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}><span style={{fontSize:14,fontWeight:700,color:C.navy}}>{s.c}</span><div style={{width:"100%",height:`${(s.c/mc)*120}px`,minHeight:8,borderRadius:8,background:`linear-gradient(180deg,${s.color},${s.color}80)`}}/><span style={{fontSize:10,color:C.g400,fontWeight:600,textAlign:"center"}}>{s.s}</span></div>)}</div></div></div>;}

// ─── TEAM ───
function TeamPg({users,onEdit,onAdd,cur}){const adm=cur?.role==="admin";const rl={admin:"danger",manager:"warning",member:"info",client:"default"};
return <div className="fi" style={{padding:28}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><h2 style={{fontSize:18,fontWeight:700,color:C.navy,fontFamily:"'Playfair Display',serif"}}>Team Members</h2>{adm&&<Btn onClick={onAdd} icon={I.plus}>Add Member</Btn>}</div><div style={{background:C.w,borderRadius:14,border:`1px solid ${C.g100}`,overflow:"hidden"}}><div style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 100px 100px 120px 80px",padding:"12px 20px",background:C.g50,borderBottom:`1px solid ${C.g100}`,gap:12}}>{["Member","Email","Role","Status","Dept",""].map(h=><span key={h} style={{fontSize:10,fontWeight:700,color:C.g400,textTransform:"uppercase",letterSpacing:".08em"}}>{h}</span>)}</div>{users.map(u=><div key={u.id} style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 100px 100px 120px 80px",padding:"14px 20px",borderBottom:`1px solid ${C.g50}`,gap:12,alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:10}}><Av ini={u.av} size={34}/><span style={{fontSize:13,fontWeight:600,color:C.navy}}>{u.name}</span></div><span style={{fontSize:12,color:C.g500}}>{u.email}</span><Bdg v={rl[u.role]}>{u.role}</Bdg><Bdg v={u.status==="active"?"success":"default"}>{u.status}</Bdg><span style={{fontSize:12,color:C.g500}}>{u.dept}</span><div style={{display:"flex",gap:4}}>{adm&&<><button onClick={()=>onEdit(u)} style={{background:"none",border:"none",cursor:"pointer",color:C.g400,padding:4}}>{I.edit}</button>{u.id!=="u1"&&<button onClick={()=>onEdit({...u,_deact:true})} style={{background:"none",border:"none",cursor:"pointer",color:C.g400,padding:4}}>{I.trash}</button>}</>}</div></div>)}</div></div>;}

// ─── SETTINGS ───
function Settings({cur}){return <div className="fi" style={{padding:28,maxWidth:700}}><h2 style={{fontSize:18,fontWeight:700,color:C.navy,fontFamily:"'Playfair Display',serif",marginBottom:24}}>Settings</h2><div style={{background:C.w,borderRadius:14,border:`1px solid ${C.g100}`,padding:"24px 28px"}}><h3 style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:16}}>Profile</h3><div style={{display:"flex",gap:20,alignItems:"center",marginBottom:20}}><Av ini={cur?.av} size={64}/><div><div style={{fontSize:16,fontWeight:700,color:C.navy}}>{cur?.name}</div><div style={{fontSize:13,color:C.g400}}>{cur?.email}</div><Bdg v="gold" style={{marginTop:6}}>{cur?.role}</Bdg></div></div><Inp label="Name" value={cur?.name||""} onChange={()=>{}}/><Inp label="Email" value={cur?.email||""} onChange={()=>{}}/><Btn>Save</Btn></div></div>;}


// ═══════════════════════════════════════════════
// ─── CHAT PAGE - Full Messaging System ───
// ═══════════════════════════════════════════════
function ChatPg({convos,msgs,setMsgs,setConvos,users,cur,setNotifs}){
  const[active,setActive]=useState(null);
  const[text,setText]=useState("");
  const[sch,setSch]=useState("");
  const[showNew,setShowNew]=useState(false);
  const[nType,setNType]=useState("direct");
  const[selMem,setSelMem]=useState([]);
  const[grpName,setGrpName]=useState("");
  const endRef=useRef(null);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,active]);

  const cName=cv=>{if(cv.type==="group")return cv.name;const o=cv.parts.find(id=>id!==cur.id);return users.find(u=>u.id===o)?.name||"Unknown";};
  const cAv=cv=>{if(cv.type==="group")return cv.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||"GR";const o=cv.parts.find(id=>id!==cur.id);return users.find(u=>u.id===o)?.av||"?";};
  const lastMsg=cv=>{const cm=msgs.filter(m=>m.cId===cv.id).sort((a,b)=>new Date(b.ts)-new Date(a.ts));return cm[0];};

  const filtered=convos.filter(c=>c.parts.includes(cur.id)).filter(c=>!sch||cName(c).toLowerCase().includes(sch.toLowerCase())).sort((a,b)=>{const la=lastMsg(a);const lb=lastMsg(b);return(lb?new Date(lb.ts):0)-(la?new Date(la.ts):0);});

  const sendMsg=()=>{
    if(!text.trim()||!active)return;
    const m={id:uid(),cId:active.id,from:cur.id,text:text,ts:new Date().toISOString()};
    setMsgs(p=>[...p,m]);setText("");
    setNotifs(p=>[{id:uid(),type:"chat",text:`${cur.name}: "${text.slice(0,40)}${text.length>40?"...":""}"`,read:false,date:fmt(now)},...p]);
  };

  const createConvo=()=>{
    if(nType==="direct"&&selMem.length===1){
      const ex=convos.find(c=>c.type==="direct"&&c.parts.includes(cur.id)&&c.parts.includes(selMem[0]));
      if(ex){setActive(ex);setShowNew(false);setSelMem([]);return;}
    }
    const cv={id:uid(),type:nType,name:nType==="group"?grpName||"New Group":null,parts:[...new Set([cur.id,...selMem])],created:new Date().toISOString()};
    setConvos(p=>[...p,cv]);setActive(cv);setShowNew(false);setSelMem([]);setGrpName("");
  };

  const cMsgs=active?msgs.filter(m=>m.cId===active.id).sort((a,b)=>new Date(a.ts)-new Date(b.ts)):[];
  const grouped=cMsgs.reduce((a,m)=>{const d=new Date(m.ts).toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"});if(!a[d])a[d]=[];a[d].push(m);return a;},{});

  return <div style={{display:"flex",height:"calc(100vh - 68px)",overflow:"hidden"}}>
    {/* ── Conversation List ── */}
    <div style={{width:320,borderRight:`1px solid ${C.g100}`,display:"flex",flexDirection:"column",background:C.w,flexShrink:0}}>
      <div style={{padding:"16px 16px 12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <h3 style={{fontSize:16,fontWeight:700,color:C.navy}}>Messages</h3>
          <button onClick={()=>setShowNew(true)} style={{background:`${C.gold}15`,border:"none",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.gold}}>{I.plus}</button>
        </div>
        <div style={{position:"relative"}}><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:C.g300,display:"flex"}}>{I.search}</span><input value={sch} onChange={e=>setSch(e.target.value)} placeholder="Search conversations..." style={{width:"100%",padding:"8px 12px 8px 34px",border:`1px solid ${C.g200}`,borderRadius:8,fontSize:13,fontFamily:"inherit",outline:"none",background:C.g50}}/></div>
      </div>
      <div style={{flex:1,overflow:"auto"}}>
        {filtered.map(cv=>{const last=lastMsg(cv);const sender=last?users.find(u=>u.id===last.from):null;const isA=active?.id===cv.id;
          const ts=last?(()=>{const d=new Date(last.ts);const diff=(now-d)/864e5;return diff<1?fmtT(last.ts):diff<7?d.toLocaleDateString("en",{weekday:"short"}):d.toLocaleDateString("en",{month:"short",day:"numeric"});})():"";
          return <div key={cv.id} onClick={()=>setActive(cv)} style={{padding:"12px 16px",display:"flex",gap:12,cursor:"pointer",transition:"background .1s",background:isA?`${C.gold}08`:"transparent",borderLeft:isA?`3px solid ${C.gold}`:"3px solid transparent"}} onMouseEnter={e=>!isA&&(e.currentTarget.style.background=C.g50)} onMouseLeave={e=>!isA&&(e.currentTarget.style.background="transparent")}>
            <Av ini={cAv(cv)} size={40} color={cv.type==="group"?C.info:C.gold}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><span style={{fontSize:13,fontWeight:600,color:C.navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cName(cv)}</span><span style={{fontSize:10,color:C.g400,flexShrink:0}}>{ts}</span></div>
              {last&&<p style={{fontSize:12,color:C.g400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sender?.id===cur.id?"You: ":""}{last.text}</p>}
              {cv.type==="group"&&<div style={{display:"flex",alignItems:"center",gap:4,marginTop:4}}><span style={{fontSize:10,color:C.g400}}>{cv.parts.length} members</span></div>}
            </div>
          </div>;
        })}
        {filtered.length===0&&<div style={{padding:40,textAlign:"center",color:C.g400,fontSize:13}}>No conversations</div>}
      </div>
    </div>

    {/* ── Chat Area ── */}
    {active?<div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
      {/* Chat Header */}
      <div style={{padding:"14px 24px",borderBottom:`1px solid ${C.g100}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.w}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Av ini={cAv(active)} size={36} color={active.type==="group"?C.info:C.gold}/>
          <div><div style={{fontSize:14,fontWeight:700,color:C.navy}}>{cName(active)}</div>
            {active.type==="group"&&<div style={{fontSize:11,color:C.g400}}>{active.parts.map(pid=>users.find(u=>u.id===pid)?.name).filter(Boolean).join(", ")}</div>}
            {active.type==="direct"&&<div style={{fontSize:11,color:C.ok,display:"flex",alignItems:"center",gap:4}}><div style={{width:6,height:6,borderRadius:"50%",background:C.ok}}/>Online</div>}
          </div>
        </div>
        {active.type==="group"&&<span style={{fontSize:12,color:C.g400,display:"flex",alignItems:"center",gap:4}}>{I.users} {active.parts.length}</span>}
      </div>
      {/* Messages */}
      <div style={{flex:1,overflow:"auto",padding:"16px 24px",background:C.g50}}>
        {Object.entries(grouped).map(([date,ms])=><div key={date}>
          <div style={{display:"flex",alignItems:"center",gap:12,margin:"20px 0 16px"}}><div style={{flex:1,height:1,background:C.g200}}/><span style={{fontSize:11,fontWeight:600,color:C.g400,flexShrink:0,padding:"2px 12px",background:C.w,borderRadius:10,border:`1px solid ${C.g200}`}}>{date}</span><div style={{flex:1,height:1,background:C.g200}}/></div>
          {ms.map((m,mi)=>{const mine=m.from===cur.id;const snd=users.find(u=>u.id===m.from);const showAv=!mine&&(mi===0||ms[mi-1]?.from!==m.from);
            return <div key={m.id} style={{display:"flex",justifyContent:mine?"flex-end":"flex-start",marginBottom:4,gap:8,alignItems:"flex-end"}}>
              {!mine&&<div style={{width:28,flexShrink:0}}>{showAv&&<Av ini={snd?.av||"?"} size={28}/>}</div>}
              <div style={{maxWidth:"65%"}}>
                {showAv&&!mine&&active.type==="group"&&<span style={{fontSize:10,fontWeight:600,color:C.g500,marginBottom:2,display:"block",marginLeft:4}}>{snd?.name}</span>}
                <div style={{padding:"10px 16px",borderRadius:mine?"18px 18px 4px 18px":"18px 18px 18px 4px",background:mine?`linear-gradient(135deg,${C.gold},${C.goldD})`:C.w,color:mine?"#fff":C.g700,fontSize:13,lineHeight:1.5,boxShadow:mine?"0 2px 8px rgba(200,164,92,.2)":"0 1px 3px rgba(0,0,0,.06)",border:mine?"none":`1px solid ${C.g100}`}}>{m.text}</div>
                <span style={{fontSize:10,color:C.g400,marginTop:3,display:"block",textAlign:mine?"right":"left",padding:"0 4px"}}>{fmtT(m.ts)}</span>
              </div>
            </div>;
          })}
        </div>)}
        <div ref={endRef}/>
      </div>
      {/* Input */}
      <div style={{padding:"12px 24px",borderTop:`1px solid ${C.g100}`,background:C.w}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button style={{background:"none",border:"none",cursor:"pointer",color:C.g400,padding:4}}>{I.clip}</button>
          <button style={{background:"none",border:"none",cursor:"pointer",color:C.g400,padding:4}}>{I.smile}</button>
          <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="Type a message..." style={{flex:1,padding:"10px 16px",border:`1px solid ${C.g200}`,borderRadius:24,fontSize:13,fontFamily:"inherit",outline:"none",background:C.g50}} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor=C.g200}/>
          <button onClick={sendMsg} disabled={!text.trim()} style={{width:40,height:40,borderRadius:"50%",border:"none",background:text.trim()?`linear-gradient(135deg,${C.gold},${C.goldD})`:C.g200,color:text.trim()?"#fff":C.g400,cursor:text.trim()?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>{I.send}</button>
        </div>
      </div>
    </div>
    :<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:C.g50}}>
      <div style={{textAlign:"center"}}><div style={{width:80,height:80,borderRadius:24,background:`${C.gold}10`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",color:C.gold}}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></div>
        <h3 style={{fontSize:18,fontWeight:700,color:C.navy,fontFamily:"'Playfair Display',serif",marginBottom:8}}>Team Chat</h3>
        <p style={{fontSize:13,color:C.g400,marginBottom:20}}>Select a conversation or start a new one</p>
        <Btn onClick={()=>setShowNew(true)} icon={I.plus}>New Conversation</Btn>
      </div>
    </div>}

    {/* ── New Chat Modal ── */}
    <Modal open={showNew} onClose={()=>{setShowNew(false);setSelMem([]);setGrpName("");}} title="New Conversation" w={440}>
      <div style={{display:"flex",gap:4,background:C.g100,borderRadius:8,padding:3,marginBottom:16}}>
        {[{k:"direct",l:"Direct Message"},{k:"group",l:"Group Chat"}].map(t=><button key={t.k} onClick={()=>{setNType(t.k);setSelMem([]);}} style={{flex:1,padding:8,border:"none",borderRadius:6,fontSize:12,fontWeight:600,fontFamily:"inherit",cursor:"pointer",background:nType===t.k?C.w:"transparent",color:nType===t.k?C.navy:C.g400,boxShadow:nType===t.k?"0 1px 4px rgba(0,0,0,.08)":"none"}}>{t.l}</button>)}
      </div>
      {nType==="group"&&<Inp label="Group Name" value={grpName} onChange={setGrpName} ph="e.g., Design Team, Project Alpha..."/>}
      <label style={{display:"block",fontSize:12,fontWeight:600,color:C.g500,marginBottom:8,textTransform:"uppercase",letterSpacing:".05em"}}>Select {nType==="direct"?"Person":"Members"}</label>
      <div style={{maxHeight:250,overflow:"auto",marginBottom:16}}>
        {users.filter(u=>u.id!==cur.id&&u.status==="active").map(u=>{const sel=selMem.includes(u.id);
          return <div key={u.id} onClick={()=>{if(nType==="direct")setSelMem([u.id]);else setSelMem(p=>sel?p.filter(id=>id!==u.id):[...p,u.id]);}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,cursor:"pointer",background:sel?`${C.gold}10`:"transparent",border:sel?`1px solid ${C.gold}30`:"1px solid transparent",marginBottom:4,transition:"all .1s"}}>
            <Av ini={u.av} size={32}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.navy}}>{u.name}</div><div style={{fontSize:11,color:C.g400}}>{u.dept} · {u.role}</div></div>
            {sel&&<div style={{width:20,height:20,borderRadius:"50%",background:C.gold,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>}
          </div>;
        })}
      </div>
      <Btn onClick={createConvo} disabled={selMem.length===0} style={{width:"100%",justifyContent:"center"}}>Start Conversation</Btn>
    </Modal>
  </div>;
}


// ═══════════════════════════════════════════════
// ─── FILES PAGE - Document Management System ───
// ═══════════════════════════════════════════════
function FilesPg({files,setFiles,folders,setFolders,projs,users,cur}){
  const[selProj,setSelProj]=useState("all");
  const[selFld,setSelFld]=useState(null);
  const[vMode,setVMode]=useState("grid");
  const[showUp,setShowUp]=useState(false);
  const[showNF,setShowNF]=useState(false);
  const[nfName,setNfName]=useState("");
  const[nfType,setNfType]=useState("pdf");
  const[nfProj,setNfProj]=useState("p1");
  const[nflName,setNflName]=useState("");
  const[nflProj,setNflProj]=useState("p1");
  const[schF,setSchF]=useState("");
  const[preview,setPreview]=useState(null);

  const fFiles=files.filter(f=>{
    const mp=selProj==="all"||f.pId===selProj;
    const mf=!selFld||f.fId===selFld;
    const ms=!schF||f.name.toLowerCase().includes(schF.toLowerCase())||f.tags?.some(t=>t.includes(schF.toLowerCase()));
    return mp&&mf&&ms;
  });
  const fFolders=folders.filter(f=>selProj==="all"||f.pId===selProj);
  const curFld=folders.find(f=>f.id===selFld);

  const upload=()=>{
    if(!nfName.trim())return;
    let fId=selFld||folders.find(f=>f.pId===nfProj)?.id;
    if(!fId){const pr=projs.find(p=>p.id===nfProj);const nf={id:uid(),name:`${pr?.name||"Project"} Files`,pId:nfProj};setFolders(p=>[...p,nf]);fId=nf.id;}
    const szs=["120 KB","340 KB","890 KB","1.2 MB","2.5 MB","4.8 MB"];
    const f={id:uid(),name:`${nfName}.${nfType}`,type:nfType,size:szs[Math.floor(Math.random()*szs.length)],pId:nfProj,fId,by:cur.id,at:new Date().toISOString(),tags:[]};
    setFiles(p=>[...p,f]);setNfName("");setShowUp(false);
  };

  const mkFolder=()=>{
    if(!nflName.trim())return;
    setFolders(p=>[...p,{id:uid(),name:nflName,pId:nflProj}]);setNflName("");setShowNF(false);
  };

  const delFile=fId=>setFiles(p=>p.filter(f=>f.id!==fId));

  return <div className="fi" style={{padding:28}}>
    {/* Header */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div><h2 style={{fontSize:18,fontWeight:700,color:C.navy,fontFamily:"'Playfair Display',serif"}}>Files & Documents</h2><p style={{fontSize:13,color:C.g400,marginTop:4}}>{files.length} files across {projs.length} projects</p></div>
      <div style={{display:"flex",gap:8}}><Btn v="secondary" onClick={()=>setShowNF(true)} icon={I.folder} sz="sm">New Folder</Btn><Btn onClick={()=>setShowUp(true)} icon={I.fileP}>Upload File</Btn></div>
    </div>
    {/* Toolbar */}
    <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:20,flexWrap:"wrap"}}>
      <div style={{position:"relative",flex:1,minWidth:200}}><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:C.g300,display:"flex"}}>{I.search}</span><input value={schF} onChange={e=>setSchF(e.target.value)} placeholder="Search files, tags..." style={{width:"100%",padding:"8px 12px 8px 34px",border:`1px solid ${C.g200}`,borderRadius:8,fontSize:13,fontFamily:"inherit",outline:"none",background:C.w}}/></div>
      <select value={selProj} onChange={e=>{setSelProj(e.target.value);setSelFld(null);}} style={{padding:"8px 14px",border:`1px solid ${C.g200}`,borderRadius:8,fontSize:13,fontFamily:"inherit",cursor:"pointer",outline:"none",background:C.w}}><option value="all">All Projects</option>{projs.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <div style={{display:"flex",gap:2,background:C.g100,borderRadius:8,padding:2}}><button onClick={()=>setVMode("grid")} style={{padding:"6px 10px",border:"none",borderRadius:6,cursor:"pointer",background:vMode==="grid"?C.w:"transparent",color:vMode==="grid"?C.navy:C.g400,display:"flex",boxShadow:vMode==="grid"?"0 1px 3px rgba(0,0,0,.06)":"none"}}>{I.grid}</button><button onClick={()=>setVMode("list")} style={{padding:"6px 10px",border:"none",borderRadius:6,cursor:"pointer",background:vMode==="list"?C.w:"transparent",color:vMode==="list"?C.navy:C.g400,display:"flex",boxShadow:vMode==="list"?"0 1px 3px rgba(0,0,0,.06)":"none"}}>{I.list}</button></div>
    </div>
    {/* Breadcrumb */}
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:16,fontSize:12,color:C.g400}}>
      <span onClick={()=>setSelFld(null)} style={{cursor:"pointer",color:selFld?C.gold:C.g600,fontWeight:600}}>All Files</span>
      {curFld&&<>{I.chR}<span style={{color:C.g600,fontWeight:600}}>{curFld.name}</span></>}
    </div>

    <div style={{display:"flex",gap:20}}>
      {/* Folder sidebar */}
      <div style={{width:220,flexShrink:0}}>
        <div style={{fontSize:10,fontWeight:700,color:C.g400,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Folders</div>
        <div onClick={()=>setSelFld(null)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,cursor:"pointer",background:!selFld?`${C.gold}10`:"transparent",color:!selFld?C.gold:C.g500,fontSize:13,fontWeight:!selFld?600:400,marginBottom:2}}>{I.folder} All Files</div>
        {fFolders.map(fl=>{const pr=projs.find(p=>p.id===fl.pId);const fc=files.filter(f=>f.fId===fl.id).length;
          return <div key={fl.id} onClick={()=>setSelFld(fl.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,cursor:"pointer",background:selFld===fl.id?`${C.gold}10`:"transparent",color:selFld===fl.id?C.gold:C.g600,fontSize:13,fontWeight:selFld===fl.id?600:400,marginBottom:2}}>
            <span style={{display:"flex",color:selFld===fl.id?C.gold:C.g400}}>{selFld===fl.id?I.folderOpen:I.folder}</span>
            <div style={{flex:1,minWidth:0}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fl.name}</div><div style={{fontSize:10,color:C.g400,fontWeight:400}}>{pr?.name} · {fc} files</div></div>
          </div>;
        })}
      </div>

      {/* File content */}
      <div style={{flex:1,minWidth:0}}>
        {vMode==="grid"?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12}}>
          {fFiles.map(f=>{const pr=projs.find(p=>p.id===f.pId);
            return <div key={f.id} className="fi" style={{background:C.w,borderRadius:12,border:`1px solid ${C.g100}`,padding:16,cursor:"pointer",transition:"all .15s"}} onClick={()=>setPreview(f)} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.gold+"40";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 16px rgba(0,0,0,.06)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.g100;e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:12,padding:"12px 0"}}><FileIcon type={f.type} size={44}/></div>
              <div style={{fontSize:12,fontWeight:600,color:C.navy,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:10,color:C.g400}}>{f.size}</span><div style={{width:6,height:6,borderRadius:"50%",background:pr?.color}}/></div>
              {f.tags?.length>0&&<div style={{display:"flex",gap:3,marginTop:6,flexWrap:"wrap"}}>{f.tags.slice(0,2).map(tag=><span key={tag} style={{fontSize:9,padding:"1px 6px",borderRadius:4,background:C.g100,color:C.g500}}>{tag}</span>)}</div>}
            </div>;
          })}
          {fFiles.length===0&&<div style={{gridColumn:"1/-1"}}><Empty icon={I.file} title="No files" desc="Upload files to get started" action={<Btn onClick={()=>setShowUp(true)} icon={I.fileP} sz="sm">Upload</Btn>}/></div>}
        </div>
        :<div style={{background:C.w,borderRadius:14,border:`1px solid ${C.g100}`,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"3fr 1fr 80px 1fr 120px 60px",padding:"10px 16px",background:C.g50,borderBottom:`1px solid ${C.g100}`,gap:12}}>{["Name","Project","Size","Uploaded By","Date",""].map(h=><span key={h} style={{fontSize:10,fontWeight:700,color:C.g400,textTransform:"uppercase"}}>{h}</span>)}</div>
          {fFiles.map(f=>{const pr=projs.find(p=>p.id===f.pId);const up=users.find(u=>u.id===f.by);
            return <div key={f.id} onClick={()=>setPreview(f)} style={{display:"grid",gridTemplateColumns:"3fr 1fr 80px 1fr 120px 60px",padding:"12px 16px",borderBottom:`1px solid ${C.g50}`,gap:12,alignItems:"center",cursor:"pointer",transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background=C.g50} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{display:"flex",alignItems:"center",gap:10}}><FileIcon type={f.type} size={28}/><span style={{fontSize:13,fontWeight:500,color:C.navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</span></div>
              <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:6,height:6,borderRadius:"50%",background:pr?.color}}/><span style={{fontSize:12,color:C.g500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pr?.name}</span></div>
              <span style={{fontSize:12,color:C.g400}}>{f.size}</span>
              <div style={{display:"flex",alignItems:"center",gap:6}}>{up&&<Av ini={up.av} size={22}/>}<span style={{fontSize:12,color:C.g500}}>{up?.name}</span></div>
              <span style={{fontSize:12,color:C.g400}}>{new Date(f.at).toLocaleDateString("en",{month:"short",day:"numeric",year:"numeric"})}</span>
              <button onClick={e=>{e.stopPropagation();delFile(f.id);}} style={{background:"none",border:"none",cursor:"pointer",color:C.g400,padding:2}}>{I.trash}</button>
            </div>;
          })}
          {fFiles.length===0&&<div style={{padding:40,textAlign:"center",color:C.g400,fontSize:13}}>No files found</div>}
        </div>}
      </div>
    </div>

    {/* Upload Modal */}
    <Modal open={showUp} onClose={()=>setShowUp(false)} title="Upload File" w={440}>
      <Inp label="File Name" value={nfName} onChange={setNfName} ph="Document name..."/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Inp label="Type" value={nfType} onChange={setNfType} opts={Object.entries(FT).map(([k,v])=>({v:k,l:`${v.l} (.${k})`}))}/>
        <Inp label="Project" value={nfProj} onChange={setNfProj} opts={projs.map(p=>({v:p.id,l:p.name}))}/>
      </div>
      <div style={{padding:"32px 20px",border:`2px dashed ${C.g300}`,borderRadius:12,textAlign:"center",background:C.g50,marginBottom:16}}>
        <div style={{color:C.g400,marginBottom:8,display:"flex",justifyContent:"center"}}>{I.fileP}</div>
        <p style={{fontSize:13,color:C.g500,fontWeight:500}}>Drag & drop files or click to browse</p>
        <p style={{fontSize:11,color:C.g400,marginTop:4}}>PDF, DOC, XLS, PNG, FIG and more</p>
      </div>
      <Btn onClick={upload} disabled={!nfName.trim()} style={{width:"100%",justifyContent:"center"}}>Upload File</Btn>
    </Modal>
    {/* New Folder */}
    <Modal open={showNF} onClose={()=>setShowNF(false)} title="Create Folder" w={400}>
      <Inp label="Folder Name" value={nflName} onChange={setNflName} ph="Folder name..."/>
      <Inp label="Project" value={nflProj} onChange={setNflProj} opts={projs.map(p=>({v:p.id,l:p.name}))}/>
      <Btn onClick={mkFolder} disabled={!nflName.trim()} style={{width:"100%",justifyContent:"center"}}>Create Folder</Btn>
    </Modal>
    {/* Preview */}
    <Modal open={!!preview} onClose={()=>setPreview(null)} title={preview?.name||"File"} w={500}>
      {preview&&(()=>{const pr=projs.find(p=>p.id===preview.pId);const up=users.find(u=>u.id===preview.by);const fl=folders.find(f=>f.id===preview.fId);
        return <div>
          <div style={{display:"flex",justifyContent:"center",padding:"30px 0",marginBottom:20,background:C.g50,borderRadius:12}}><FileIcon type={preview.type} size={80}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {[{l:"Type",v:FT[preview.type]?.l||preview.type},{l:"Size",v:preview.size},{l:"Project",v:pr?.name},{l:"Folder",v:fl?.name||"Root"},{l:"Uploaded By",v:up?.name},{l:"Date",v:new Date(preview.at).toLocaleDateString("en",{month:"long",day:"numeric",year:"numeric"})}].map(d=><div key={d.l}><div style={{fontSize:10,fontWeight:700,color:C.g400,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>{d.l}</div><div style={{fontSize:13,fontWeight:500,color:C.g700}}>{d.v}</div></div>)}
          </div>
          {preview.tags?.length>0&&<div style={{marginTop:16}}><div style={{fontSize:10,fontWeight:700,color:C.g400,textTransform:"uppercase",marginBottom:6}}>Tags</div><div style={{display:"flex",gap:4}}>{preview.tags.map(t=><Bdg key={t} v="gold">{t}</Bdg>)}</div></div>}
          <div style={{display:"flex",gap:8,marginTop:20,paddingTop:16,borderTop:`1px solid ${C.g100}`}}>
            <Btn v="secondary" icon={I.dl} style={{flex:1,justifyContent:"center"}}>Download</Btn>
            <Btn v="danger" icon={I.trash} onClick={()=>{delFile(preview.id);setPreview(null);}}>Delete</Btn>
          </div>
        </div>;
      })()}
    </Modal>
  </div>;
}


// ─── NOTIFICATIONS ───
function NotifPanel({open,onClose,notifs,onMark}){if(!open)return null;return <div style={{position:"fixed",top:0,right:0,bottom:0,width:380,background:C.w,boxShadow:"-8px 0 30px rgba(0,0,0,.12)",zIndex:999,display:"flex",flexDirection:"column"}} className="fi"><div style={{padding:"20px 24px",borderBottom:`1px solid ${C.g100}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 style={{fontSize:16,fontWeight:700,color:C.navy}}>Notifications</h3><div style={{display:"flex",gap:8}}><Btn v="ghost" sz="sm" onClick={onMark}>Mark all read</Btn><button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:C.g400}}>{I.x}</button></div></div><div style={{flex:1,overflow:"auto",padding:"8px 12px"}}>{notifs.map(n=><div key={n.id} style={{padding:"14px 16px",borderRadius:10,marginBottom:4,background:n.read?"transparent":`${C.gold}06`,borderLeft:n.read?"none":`3px solid ${C.gold}`}}><div style={{display:"flex",gap:8,alignItems:"flex-start"}}>{!n.read&&<div style={{width:6,height:6,borderRadius:"50%",background:C.gold,marginTop:6,flexShrink:0}}/>}<div><p style={{fontSize:13,color:C.g700,lineHeight:1.5}}>{n.text}</p><span style={{fontSize:11,color:C.g400,marginTop:4,display:"block"}}>{n.date}</span></div></div></div>)}</div></div>;}

// ─── LOGIN ───
function Login({users,onLogin}){const[em,setEm]=useState("");const[pw,setPw]=useState("");const[err,setErr]=useState("");
  const go=()=>{const u=users.find(u=>u.email===em);if(u){onLogin(u);setErr("");}else setErr("Invalid credentials. Try: issa@hissado.com");};
  return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,${C.navy} 0%,${C.navyL} 50%,${C.navyM} 100%)`,padding:20}}>
    <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none"}}><div style={{position:"absolute",top:"10%",left:"15%",width:300,height:300,borderRadius:"50%",background:`${C.gold}06`,filter:"blur(80px)"}}/><div style={{position:"absolute",bottom:"20%",right:"10%",width:400,height:400,borderRadius:"50%",background:`${C.gold}04`,filter:"blur(100px)"}}/></div>
    <div className="si" style={{background:C.w,borderRadius:20,width:"100%",maxWidth:420,padding:"48px 40px",boxShadow:"0 30px 60px rgba(0,0,0,.25)",position:"relative"}}>
      <div style={{textAlign:"center",marginBottom:36}}><div style={{width:56,height:56,background:`linear-gradient(135deg,${C.gold},${C.goldD})`,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><span style={{color:"#fff",fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:32,lineHeight:1}}>H</span></div><h1 style={{fontSize:22,fontWeight:700,color:C.navy,fontFamily:"'Playfair Display',serif",letterSpacing:".06em"}}>HISSADO PROJECT</h1><p style={{fontSize:13,color:C.g400,marginTop:6}}>Sign in to your workspace</p></div>
      {err&&<div style={{padding:"10px 14px",borderRadius:10,background:"#FEE2E2",color:"#DC2626",fontSize:12,marginBottom:16}}>{err}</div>}
      <Inp label="Email" value={em} onChange={setEm} ph="your@email.com" type="email"/>
      <Inp label="Password" value={pw} onChange={setPw} ph="••••••••" type="password"/>
      <Btn onClick={go} style={{width:"100%",padding:12,justifyContent:"center",fontSize:14,borderRadius:10}}>Sign In</Btn>
      <div style={{marginTop:24,padding:16,background:C.g50,borderRadius:12}}>
        <div style={{fontSize:11,fontWeight:600,color:C.g400,marginBottom:8,textTransform:"uppercase",letterSpacing:".05em"}}>Quick Login</div>
        {users.filter(u=>u.status==="active").slice(0,4).map(u=><button key={u.id} onClick={()=>onLogin(u)} style={{width:"100%",padding:"8px 12px",border:"none",borderRadius:8,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:10,fontFamily:"inherit",marginBottom:2,transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background=C.g100} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><Av ini={u.av} size={28}/><div style={{textAlign:"left"}}><div style={{fontSize:12,fontWeight:600,color:C.g700}}>{u.name}</div><div style={{fontSize:10,color:C.g400}}>{u.email} · {u.role}</div></div></button>)}
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════
// ─── MAIN APP ───
// ═══════════════════════════════════════════════
export default function HissadoProject(){
  const[loading,setLoading]=useState(true);
  const[cur,setCur]=useState(null);
  const[pg,setPg]=useState("dashboard");
  const[col,setCol]=useState(false);
  const[sq,setSq]=useState("");
  const[showN,setShowN]=useState(false);

  const[users,setUsers]=useState(S_USERS);
  const[projs,setProjs]=useState(S_PROJ);
  const[tasks,setTasks]=useState(S_TASKS);
  const[notifs,setNotifs]=useState(S_NOTIF);
  const[convos,setConvos]=useState(S_CONVOS);
  const[msgs,setMsgs]=useState(S_MSGS);
  const[files,setFiles]=useState(S_FILES);
  const[folders,setFolders]=useState(S_FLDRS);

  const[selTask,setSelTask]=useState(null);
  const[selProj,setSelProj]=useState(null);
  const[showTM,setShowTM]=useState(false);
  const[showPM,setShowPM]=useState(false);
  const[showUM,setShowUM]=useState(false);
  const[editU,setEditU]=useState(null);

  const[nT,setNT]=useState({title:"",desc:"",status:"To Do",pri:"Medium",assignee:"u1",pId:"p1",due:fmt(addD(now,7))});
  const[nP,setNP]=useState({name:"",desc:"",color:"#C8A45C",status:"active"});
  const[nU,setNU]=useState({name:"",email:"",role:"member",dept:"",status:"active"});

  useEffect(()=>{(async()=>{const d=await load();if(d){if(d.users)setUsers(d.users);if(d.projs)setProjs(d.projs);if(d.tasks)setTasks(d.tasks);if(d.notifs)setNotifs(d.notifs);if(d.cur)setCur(d.cur);if(d.convos)setConvos(d.convos);if(d.msgs)setMsgs(d.msgs);if(d.files)setFiles(d.files);if(d.folders)setFolders(d.folders);}setLoading(false);})();},[]);

  useEffect(()=>{if(!loading)save({users,projs,tasks,notifs,cur,convos,msgs,files,folders});},[users,projs,tasks,notifs,cur,convos,msgs,files,folders,loading]);

  const onTC=t=>{setSelTask(t);setShowTM(true);};
  const onTU=u=>{setTasks(p=>p.map(t=>t.id===u.id?u:t));setShowTM(false);};
  const addTask=()=>{const t={...nT,id:uid(),created:fmt(now),subs:[],cmts:[],prog:0,pId:selProj?.id||nT.pId};setTasks(p=>[...p,t]);setNT({title:"",desc:"",status:"To Do",pri:"Medium",assignee:"u1",pId:selProj?.id||"p1",due:fmt(addD(now,7))});setShowTM(false);setNotifs(p=>[{id:uid(),type:"assign",text:`New task: '${t.title}'`,read:false,date:fmt(now)},...p]);};
  const addProj=()=>{const p={...nP,id:uid(),owner:cur?.id||"u1",members:[cur?.id||"u1"],created:fmt(now)};setProjs(pr=>[...pr,p]);setNP({name:"",desc:"",color:"#C8A45C",status:"active"});setShowPM(false);setFolders(fl=>[...fl,{id:uid(),name:`${p.name} Files`,pId:p.id}]);};
  const editUser=u=>{if(u._deact){setUsers(p=>p.map(x=>x.id===u.id?{...x,status:x.status==="active"?"inactive":"active"}:x));}else{setEditU(u);setNU({name:u.name,email:u.email,role:u.role,dept:u.dept,status:u.status});setShowUM(true);}};
  const saveUser=()=>{if(editU){setUsers(p=>p.map(u=>u.id===editU.id?{...u,...nU,av:nU.name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)}:u));}else{setUsers(p=>[...p,{...nU,id:uid(),av:nU.name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)}]);}setEditU(null);setNU({name:"",email:"",role:"member",dept:"",status:"active"});setShowUM(false);};

  const fTasks=useMemo(()=>{if(!sq)return tasks;const q=sq.toLowerCase();return tasks.filter(t=>t.title.toLowerCase().includes(q)||t.desc?.toLowerCase().includes(q));},[tasks,sq]);

  const titles={dashboard:"Dashboard",projects:"Projects",tasks:"My Tasks",calendar:"Calendar",reports:"Reports",team:"Team",settings:"Settings",chat:"Messages",files:"Files",pdetail:selProj?.name||"Project"};

  if(loading)return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.navy}}><div style={{textAlign:"center"}}><div style={{width:48,height:48,background:`linear-gradient(135deg,${C.gold},${C.goldD})`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",animation:"p 1.5s infinite"}}><span style={{color:"#fff",fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:28}}>H</span></div><div style={{color:C.goldL,fontSize:13}}>Loading...</div></div></div>;
  if(!cur)return <Login users={users} onLogin={u=>setCur(u)}/>;

  return <div style={{display:"flex",minHeight:"100vh",background:C.g50}}>
    <style>{css}</style>
    <Side pg={pg} setPg={setPg} projs={projs} col={col} setCol={setCol} user={cur} unread={0}/>
    <main style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
      {pg!=="chat"&&<Hdr title={titles[pg]||"Dashboard"} sub={pg==="dashboard"?`Welcome back, ${cur.name.split(" ")[0]}`:null} notifs={notifs} onN={()=>setShowN(true)} sq={sq} setSq={setSq}/>}
      <div style={{flex:1,overflow:pg==="chat"?"hidden":"auto"}}>
        {pg==="dashboard"&&<Dash projs={projs} tasks={fTasks} users={users}/>}
        {pg==="projects"&&<ProjsPage projs={projs} tasks={tasks} users={users} onAdd={()=>setShowPM(true)} setSelP={setSelProj} setPg={setPg}/>}
        {pg==="pdetail"&&<PDetail proj={selProj} tasks={fTasks} users={users} projs={projs} onTC={onTC} onAT={()=>{setSelTask(null);setShowTM(true);}} setPg={setPg}/>}
        {pg==="tasks"&&<MyTasks tasks={fTasks} projs={projs} users={users} onTC={onTC} onAT={()=>{setSelTask(null);setShowTM(true);}}/>}
        {pg==="chat"&&<ChatPg convos={convos} msgs={msgs} setMsgs={setMsgs} setConvos={setConvos} users={users} cur={cur} setNotifs={setNotifs}/>}
        {pg==="files"&&<FilesPg files={files} setFiles={setFiles} folders={folders} setFolders={setFolders} projs={projs} users={users} cur={cur}/>}
        {pg==="calendar"&&<div style={{padding:28}}><h2 style={{fontSize:18,fontWeight:700,color:C.navy,fontFamily:"'Playfair Display',serif",marginBottom:20}}>Calendar</h2><CalView tasks={fTasks} projs={projs} users={users} onTC={onTC}/></div>}
        {pg==="reports"&&<Reports projs={projs} tasks={tasks} users={users}/>}
        {pg==="team"&&<TeamPg users={users} onEdit={editUser} onAdd={()=>{setEditU(null);setNU({name:"",email:"",role:"member",dept:"",status:"active"});setShowUM(true);}} cur={cur}/>}
        {pg==="settings"&&<Settings cur={cur}/>}
      </div>
    </main>

    <NotifPanel open={showN} onClose={()=>setShowN(false)} notifs={notifs} onMark={()=>setNotifs(p=>p.map(n=>({...n,read:true})))}/>
    {showN&&<div onClick={()=>setShowN(false)} style={{position:"fixed",inset:0,zIndex:998}}/>}

    {selTask&&<TDetail open={showTM} task={selTask} onClose={()=>{setShowTM(false);setSelTask(null);}} onUpdate={onTU} projs={projs} users={users}/>}

    {!selTask&&showTM&&<Modal open={true} onClose={()=>setShowTM(false)} title="Create New Task">
      <Inp label="Title" value={nT.title} onChange={v=>setNT({...nT,title:v})} ph="Task title..."/>
      <Inp label="Description" value={nT.desc} onChange={v=>setNT({...nT,desc:v})} ph="Description..." ta/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Inp label="Project" value={nT.pId} onChange={v=>setNT({...nT,pId:v})} opts={projs.map(p=>({v:p.id,l:p.name}))}/>
        <Inp label="Assignee" value={nT.assignee} onChange={v=>setNT({...nT,assignee:v})} opts={users.map(u=>({v:u.id,l:u.name}))}/>
        <Inp label="Priority" value={nT.pri} onChange={v=>setNT({...nT,pri:v})} opts={PRI.map(p=>({v:p,l:p}))}/>
        <Inp label="Due Date" value={nT.due} onChange={v=>setNT({...nT,due:v})} type="date"/>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:8}}><Btn v="secondary" onClick={()=>setShowTM(false)}>Cancel</Btn><Btn onClick={addTask} disabled={!nT.title.trim()}>Create Task</Btn></div>
    </Modal>}

    <Modal open={showPM} onClose={()=>setShowPM(false)} title="Create Project">
      <Inp label="Name" value={nP.name} onChange={v=>setNP({...nP,name:v})} ph="Project name..."/>
      <Inp label="Description" value={nP.desc} onChange={v=>setNP({...nP,desc:v})} ph="Description..." ta/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={{marginBottom:16}}><label style={{display:"block",fontSize:12,fontWeight:600,color:C.g500,marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>Color</label><div style={{display:"flex",gap:8}}>{["#C8A45C","#5B8DEF","#6FCF97","#F2994A","#EB5757","#BB6BD9","#2D9CDB"].map(c=><button key={c} onClick={()=>setNP({...nP,color:c})} style={{width:28,height:28,borderRadius:"50%",background:c,border:nP.color===c?`3px solid ${C.navy}`:"2px solid transparent",cursor:"pointer"}}/>)}</div></div>
        <Inp label="Status" value={nP.status} onChange={v=>setNP({...nP,status:v})} opts={[{v:"active",l:"Active"},{v:"on-hold",l:"On Hold"}]}/>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:8}}><Btn v="secondary" onClick={()=>setShowPM(false)}>Cancel</Btn><Btn onClick={addProj} disabled={!nP.name.trim()}>Create Project</Btn></div>
    </Modal>

    <Modal open={showUM} onClose={()=>{setShowUM(false);setEditU(null);}} title={editU?"Edit Member":"Add Member"}>
      <Inp label="Name" value={nU.name} onChange={v=>setNU({...nU,name:v})} ph="Full name..."/>
      <Inp label="Email" value={nU.email} onChange={v=>setNU({...nU,email:v})} ph="email@example.com" type="email"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Inp label="Role" value={nU.role} onChange={v=>setNU({...nU,role:v})} opts={[{v:"admin",l:"Admin"},{v:"manager",l:"Manager"},{v:"member",l:"Member"},{v:"client",l:"Client"}]}/><Inp label="Department" value={nU.dept} onChange={v=>setNU({...nU,dept:v})} ph="Department..."/></div>
      <Inp label="Status" value={nU.status} onChange={v=>setNU({...nU,status:v})} opts={[{v:"active",l:"Active"},{v:"inactive",l:"Inactive"}]}/>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:8}}><Btn v="secondary" onClick={()=>{setShowUM(false);setEditU(null);}}>Cancel</Btn><Btn onClick={saveUser} disabled={!nU.name.trim()||!nU.email.trim()}>{editU?"Save":"Add Member"}</Btn></div>
    </Modal>
  </div>;
}
