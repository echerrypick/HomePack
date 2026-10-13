import { Building2, FileText, Home, MapPin, ShieldCheck, Waves } from 'lucide-react';

export function ReportPreview({ variant = 'overview', className = '' }: { variant?: 'overview' | 'energy' | 'area' | 'history'; className?: string }) {
  return <div className={`hp-paper hp-paper-${variant} ${className}`} aria-hidden="true">
    <div className="hp-paper-brand"><span><Building2 size={18} /> <b>UKHomePack.com<small>UK Property Reports</small></b></span><small>Property Report<br />Illustrative sample</small></div>
    {variant === 'overview' ? <>
      <h3>12 Example Street, Derby</h3><p className="hp-paper-postcode">DE1 2AB · Illustrative address</p>
      <div className="hp-property-overview"><img src="/images/terraced-houses.jpg" alt="" /><div><b>Property overview</b>{[['Property type','Terraced house'],['Bedrooms','3'],['Bathrooms','1'],['Floor area','66 m² (approx.)'],['Council tax band','B'],['Local authority','Derby City Council']].map(([label,value])=><p key={label}><span>{label}</span><span>{value}</span></p>)}</div></div>
      <div className="hp-report-metrics">
        <div><small>Last sold price</small><Home /><b>£210,000</b><small>Mar 2021</small></div>
        <div><small>EPC rating</small><b className="hp-epc-value"><span>C</span>72</b></div>
        <div><small>Nearby planning</small><FileText /><b>5 applications</b><small>Illustrative results</small></div>
        <div><small>Flood information</small><Waves /><b>Check source</b><small>Coverage varies</small></div>
        <div><small>Local crime</small><ShieldCheck className="hp-green" /><b>Area context</b><small>Recorded incidents</small></div>
        <div className="hp-mini-map"><MapPin /></div>
      </div>
    </> : variant === 'energy' ? <>
      <h4>Energy performance</h4><div className="hp-energy-chart">{['A','B','C','D','E','F','G'].map((band,index)=><div key={band} style={{width:`${40+index*9}%`,background:['#169b55','#4eb845','#9bc626','#efd817','#f4af28','#e87630','#d93b34'][index]}}>{band}<span>{index===2?'72': ''}</span></div>)}</div><h4>Local area</h4><div className="hp-mini-map hp-map-large"><MapPin /></div><h4>Nearby amenities</h4>{['Primary school','Supermarket','Train station','GP surgery'].map((name,index)=><p className="hp-paper-row" key={name}><span>{name}</span><span>{(index+2)/10} miles</span></p>)}
    </> : variant === 'area' ? <>
      <h4>Area map & local information</h4><div className="hp-mini-map hp-map-large"><MapPin /></div><h4>Nearby amenities</h4>{['Primary school','Supermarket','Train station','GP surgery','Park / green space'].map((name,index)=><p className="hp-paper-row" key={name}><span><Home size={12} />{name}</span><span>{(index+2)/10} miles</span></p>)}
    </> : <>
      <h4>Property history</h4><div className="hp-paper-row"><b>Date</b><b>Price</b><b>Change</b></div>{[['Mar 2021','£210,000','—'],['Jan 2017','£185,000','+13.5%'],['Aug 2014','£163,000','+2.9%'],['May 2011','£158,000','+2.2%'],['Sep 2008','£154,000','—']].map(([date,price,change])=><div className="hp-paper-row" key={date}><span>{date}</span><span>{price}</span><span className="hp-green">{change}</span></div>)}<svg className="hp-price-chart" viewBox="0 0 240 120"><defs><pattern id="hp-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#dbe5ef" /></pattern></defs><rect width="240" height="120" fill="url(#hp-grid)"/><path d="M0 105 L40 95 L80 85 L120 72 L160 52 L200 34 L240 24 V120 H0Z" fill="#e6eef9"/><path d="M0 105 L40 95 L80 85 L120 72 L160 52 L200 34 L240 24" fill="none" stroke="#31567f" strokeWidth="3"/>{[[0,105],[40,95],[80,85],[120,72],[160,52],[200,34],[240,24]].map(([cx,cy])=><circle key={cx} cx={cx} cy={cy} r="4" fill="#31567f"/>)}</svg>
    </>}
  </div>;
}
