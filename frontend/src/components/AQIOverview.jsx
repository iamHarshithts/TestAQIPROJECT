import {
  Wind, MapPin, Navigation, Calendar, Map as MapIcon,
  Activity, Info, CloudRain, AlertCircle, ChevronDown
} from 'lucide-react';
import { useState } from 'react';

const POLLUTANT_INFO = {
  co:    { full: "Carbon Monoxide",    desc: "Produced by incomplete combustion of fossil fuels. High levels can cause headaches, dizziness, and at very high concentrations, death." },
  nh3:   { full: "Ammonia",            desc: "Released from agricultural activities and waste. Causes respiratory irritation and contributes to particulate matter formation." },
  no:    { full: "Nitric Oxide",       desc: "A precursor to NO₂, produced by vehicle engines and industrial processes. Reacts with oxygen to form harmful nitrogen dioxide." },
  no2:   { full: "Nitrogen Dioxide",   desc: "Emitted from vehicle exhausts and power plants. Irritates the respiratory system and contributes to smog and acid rain." },
  nox:   { full: "Nitrogen Oxides",    desc: "A collective term for NO and NO₂. Major contributors to smog, acid rain, and respiratory problems." },
  o3:    { full: "Ozone",              desc: "Ground-level ozone forms when sunlight reacts with pollutants. Can trigger asthma, reduce lung function, and damage vegetation." },
  pm10:  { full: "Particulate Matter (≤10µm)", desc: "Coarse particles from dust, pollen, and mold. Can penetrate the lungs and cause respiratory and cardiovascular issues." },
  pm2_5: { full: "Fine Particulate Matter (≤2.5µm)", desc: "Tiny particles from combustion and industrial processes. Can enter the bloodstream and cause serious heart and lung disease." },
  so2:   { full: "Sulphur Dioxide",    desc: "Released from burning fossil fuels and volcanic activity. Causes respiratory problems and is a major contributor to acid rain." },
};

const AQIOverview = ({ data, locationName }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 animate-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-xl border border-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10"><Wind size={120} /></div>
          <p className="text-black-400 font-bold uppercase tracking-widest text-xl mb-2">Current AQI</p>

          <div className="flex items-center gap-1.5 mb-3">
            <MapPin size={15} className="text-slate-400" />
            <span className="text-slate-500 text-xl font-medium truncate">
              {locationName || "Fetching location..."}
            </span>
          </div>

          <h2 className="text-6xl font-black mb-4" style={{ color: data.color }}>{data.cpcb_aqi}</h2>
          <div className="inline-block px-4 py-1.5 rounded-full text-white font-bold text-sm mb-6" style={{ backgroundColor: data.color }}>
            {data.category}
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <p className="text-slate-500 text-md font-bold mb-1 uppercase">Health Insight</p>
            <p className="text-xl font-medium leading-relaxed italic">
              "{data.insight}"
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(data.pollutants).map(([key, val]) => (
            <div key={key} className="bg-white/80 p-5 rounded-3xl border border-white shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-2">
                <span className="text-slate-400 font-bold uppercase text-[20px] tracking-widest group-hover:text-blue-500 transition-colors">{key.replace('_', '.')}</span>
                <span className="text-md text-black-300 font-medium">µg/m³</span>
              </div>
              <p className="text-2xl font-black text-slate-800">{val.toFixed(2)}</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full" style={{ width: `${Math.min((val / 200) * 100, 100)}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pollutant Abbreviations — collapsible */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-8 py-5 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Info size={18} className="text-blue-400" />
            <span className="font-black text-slate-700 uppercase tracking-widest text-sm">Pollutant Reference Guide</span>
          </div>
          <ChevronDown
            size={18}
            className="text-slate-400 transition-transform duration-300"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>

        {open && (
          <div className="px-8 pb-7 pt-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(POLLUTANT_INFO).map(([key, info]) => (
              <div key={key} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-500 font-black uppercase text-sm tracking-widest">
                    {key.replace('_', '.')}
                  </span>
                  <span className="text-slate-300 text-xs">—</span>
                  <span className="text-slate-600 font-bold text-xs">{info.full}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{info.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AQIOverview;