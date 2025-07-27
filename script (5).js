<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>California SGIP Eligibility & Rebate Estimator (v16)</title>
  <style>
    :root{--primary:#fdb813;--secondary:#003c71;--accent:#005eb8;--bg:#f9f9f9;--text:#333;--muted:#666}
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,Helvetica,sans-serif;background:var(--bg);color:var(--text);line-height:1.45;padding-bottom:4rem}
    h1{font-size:2rem;font-weight:700;color:var(--primary);text-align:center;margin:1.4rem 0}
    .wrapper{max-width:960px;margin:0 auto;padding:0 1rem}
    fieldset{border:1px solid #ddd;border-radius:6px;padding:1rem;margin-bottom:1rem}
    legend{font-weight:600;color:var(--secondary);padding:0 .5rem}
    label{display:block;font-weight:600;color:var(--secondary);margin:.9rem 0 .4rem}
    select,input{width:100%;padding:10px;border:1px solid #ccc;border-radius:4px;font-size:1rem}
    small{display:block;margin-top:4px;color:var(--muted);font-size:.85rem}
    button{display:block;width:100%;background:var(--primary);color:#fff;border:none;padding:12px;font-size:1rem;border-radius:4px;font-weight:600;cursor:pointer;transition:background .3s;margin-top:1rem}
    button:hover{background:var(--accent)}button:disabled{opacity:.6;cursor:not-allowed}
    #incomeResult,#result{display:none;margin-top:22px;padding:18px;background:#fff;border-left:5px solid var(--primary);border-radius:4px;font-size:1rem}
    #result h3,#incomeResult h3{margin-top:0;color:var(--secondary)}
    .badge{display:inline-block;background:var(--secondary);color:#fff;padding:.25rem .55rem;border-radius:3px;font-size:.78rem;margin-right:6px}
    .track{margin-bottom:1rem}
    footer{font-size:.85rem;color:var(--muted);text-align:center;margin:3rem 0}
    ul{margin:0.5rem 0 0 1.2rem}
  </style>
</head>
<body>
  <h1>California SGIP Rebate Estimator</h1>
  <div class="wrapper">
    <p style="margin:0 0 1rem;font-size:.95rem;color:var(--muted)">Answer a few questions to see every SGIP track you may qualify for and a ball‑park rebate estimate.</p>

    <form id="calcForm" autocomplete="off" novalidate>
      <fieldset>
        <legend>1. Project details</legend>
        <label for="address">Installation address <em>(optional)</em></label>
        <input id="address" name="address" placeholder="1234 Main St, Fresno CA" />

        <label for="utility">Utility company</label>
        <select id="utility" name="utility" required>
          <option value="">Choose…</option>
          <option>CSE</option><option>SCE</option><option>SCG</option><option>PG&E</option><option>LADWP</option>
        </select>

        <label for="county">County <em>(for income test)</em></label>
        <select id="county" name="county" required>
          <option value="">Choose county…</option>
        </select>

        <label for="hhSize">Household size (persons)</label>
        <input id="hhSize" name="hhSize" type="number" min="1" max="8" step="1" value="4">

        <label for="hhIncome">Annual household income ($)</label>
        <input id="hhIncome" name="hhIncome" type="number" min="0" step="1000" placeholder="e.g. 95000">
        <small class="note">Low-income threshold = ≤ 80% AMI for selected county & household size.</small>
      </fieldset>

      <fieldset>
        <legend>2. Customer</legend>
        <label for="custType">Customer type</label>
        <select id="custType" name="custType" required>
          <option value="">Choose…</option>
          <option value="single">Home – Single-Family</option>
          <option value="multi">Home – Multifamily</option>
          <option value="nonres">Business / Non-Residential</option>
        </select>

        <label for="critFlag">Medical Baseline enrollee or critical well-pump?</label>
        <select id="critFlag" name="critFlag" required>
          <option value="">Choose…</option><option value="yes">Yes</option><option value="no">No</option>
        </select>
      </fieldset>

      <fieldset>
        <legend>3. Resiliency</legend>
        <label for="dacFlag">Site in DAC or HFTD?</label>
        <select id="dacFlag" name="dacFlag" required>
          <option value="">Choose…</option><option value="yes">Yes</option><option value="no">No / Unsure</option>
        </select>

        <label for="pspsFlag">≥ 2 PSPS shut‑offs since 2017?</label>
        <select id="pspsFlag" name="pspsFlag" required>
          <option value="">Choose…</option><option value="yes">Yes</option><option value="no">No / Unsure</option>
        </select>

        <label for="criticalFac">(Non‑Res) Critical facility?</label>
        <select id="criticalFac" name="criticalFac">
          <option value="">Choose…</option><option value="yes">Yes</option><option value="no">No</option>
        </select>

        <label for="sjvFlag">In San Joaquin Valley pilot city?</label>
        <select id="sjvFlag" name="sjvFlag" required>
          <option value="">Choose…</option><option value="yes">Yes</option><option value="no">No</option>
        </select>
      </fieldset>

      <fieldset>
        <legend>4. System size</legend>
        <label for="storageKWh">Battery usable capacity (kWh)</label>
        <input id="storageKWh" name="storageKWh" type="number" min="0" step="0.1" placeholder="e.g. 20" required>

        <label for="solarKW">Solar array size (kW) <em>(if pairing)</em></label>
        <input id="solarKW" name="solarKW" type="number" min="0" step="0.1" placeholder="e.g. 6">
      </fieldset>

      <button type="submit" id="btnCalc">Calculate & save</button>
    </form>

    <div id="incomeResult"></div>
    <div id="#result"></div>
  </div>

  <footer>Unofficial tool – rates current as of July 27 2025. Actual rebate subject to SGIP budget availability & PA review.</footer>

  <script>
    const $ = s => document.querySelector(s);
    const money = v => v.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
    const rateFmt = v => `$${v.toFixed(2)}`;

    // County AMI data
    const COUNTY_AMI = {"Alameda":159800,"Alpine":129500,"Amador":109900,"Butte":96600,"Calaveras":101500,
      "Colusa":96400,"Contra Costa":159800,"Del Norte":93900,"El Dorado":120800,"Fresno":93900,"Glenn":93900,
      "Humboldt":93900,"Imperial":93900,"Inyo":97200,"Kern":93900,"Kings":93900,"Lake":93900,"Lassen":93900,
      "Los Angeles":106600,"Madera":93900,"Marin":186600,"Mariposa":93900,"Mendocino":93900,"Merced":93900,
      "Modoc":93900,"Mono":118500,"Monterey":104500,"Napa":146700,"Nevada":124600,"Orange":136600,
      "Placer":120800,"Plumas":95300,"Riverside":103900,"Sacramento":120800,"San Benito":140200,
      "San Bernardino":103900,"San Diego":130800,"San Francisco":186600,"San Joaquin":104600,
      "San Luis Obispo":125600,"San Mateo":186600,"Santa Barbara":119100,"Santa Clara":195200,
      "Santa Cruz":132800,"Shasta":101800,"Sierra":93900,"Siskiyou":93900,"Solano":124600,
      "Sonoma":132000,"Stanislaus":98500,"Sutter":98900,"Tehama":93900,"Trinity":93900,
      "Tulare":93900,"Tuolumne":101600,"Ventura":131300,"Yolo":135900,"Yuba":98900};

    // SGIP rate catalogue
    const RATES = {smallRes:0.15, largeScale:0.25, largeScaleAdder:0.15,
      equityStorage:0.85, equitySolarStorage:1.10, equitySolarAdder:3.10,
      equityResiliency:1.00, nonResEquity:0.85, sjvRes:1.10, sjvNonRes:1.00,
      gen:2.00, genResAdd:2.50
    };

    function catalog() {
      return [
        {
          key:'equitySolarStorage',name:'Equity Solar + Storage',badge:'Equity S+S',
          elig:u=>u.isLowIncome&&u.dac,rate:`${rateFmt(RATES.equitySolarStorage)}/Wh + ${rateFmt(RATES.equitySolarAdder)}/W`,
          calc:u=>u.stWh*RATES.equitySolarStorage + u.solW*RATES.equitySolarAdder,
          description:'Low-income residential in disadvantaged community with solar + storage pairing.',
          docs:['Online Reservation Request Form','Proof of Income','Proof of Equity Eligibility','Utility bill','Equipment specs']
        },
        /* ... other tracks ... */
      ];
    }

    const SIZE_FACTOR=[0.7,0.8,0.9,1,1.08,1.16,1.24,1.32];
    function calc80(c,size){const b=COUNTY_AMI[c];if(!b)return null;const idx=Math.max(0,Math.min(size-1,SIZE_FACTOR.length-1));return b*SIZE_FACTOR[idx]*0.8;}

    function populateCounties(){const sel=$('#county');sel.innerHTML='<option value="">Choose county…</option>'+Object.keys(COUNTY_AMI).sort().map(c=>`<option>${c}</option>`).join('');}
    function restoreDraft(){const d=localStorage.getItem('sgipDraft');if(!d)return;Object.entries(JSON.parse(d)).forEach(([k,v])=>{const el=$(`[name="${k}"]`);if(el)el.value=v;});}

    window.addEventListener('DOMContentLoaded',()=>{
      populateCounties();restoreDraft();
      $('#calcForm').addEventListener('submit',e=>{
        e.preventDefault();const data=Object.fromEntries(new FormData(e.target).entries());
        localStorage.setItem('sgipDraft',JSON.stringify(data));
        const hhSize=parseInt(data.hhSize,10),hhInc=parseFloat(data.hhIncome)||0;
        const stWh=(parseFloat(data.storageKWh)||0)*1000,solW=(parseFloat(data.solarKW)||0)*1000;
        const threshold=calc80(data.county,hhSize);
        const isLow=threshold&&hhInc>0&&hhInc<=threshold;
        const user={...data,hhSize,hhInc,stWh,solW,isLowIncome:isLow,dac:data.dacFlag==='yes',psps:data.pspsFlag==='yes',crit:data.critFlag==='yes',sjv:data.sjvFlag==='yes'};
        const incEl=$('#incomeResult');incEl.style.display='block';incEl.innerHTML=`<h3>Income eligibility</h3><p>80% AMI threshold (${data.county}, ${hhSize}): <strong>${money(threshold)}</strong></p><p>Your income: <strong>${money(hhInc)}</strong> — <strong>${isLow?'Low Income':'Above limit'}</strong></p>`;
        const resEl=$('#result');resEl.style.display='block';resEl.innerHTML='<h3>Estimated SGIP Rebates</h3>';
        catalog().filter(t=>t.elig(user)).forEach(t=>{
          const amt=money(t.calc(user));
          let html='<div class="track"><span class="badge">'+t.badge+'</span> <strong>'+t.name+'</strong>: '+amt;
          html+='<ul>';
          html+='<li><strong>Rate:</strong> '+t.rate+'</li>';
          html+='<li><strong>Estimated Amount:</strong> '+amt+'</li>';
          html+='<li><strong>Eligibility:</strong> '+t.description+'</li>';
          html+='<li><strong>Required Documentation:</strong><ul>';
          t.docs.forEach(doc=>{html+='<li>'+doc+'</li>';});
          html+='</ul></li></ul></div>';
          resEl.innerHTML+=html;
        });
      });
    });
  </script>
</body>
</html>
