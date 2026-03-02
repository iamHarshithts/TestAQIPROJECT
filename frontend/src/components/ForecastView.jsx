import React from 'react';
import { Calendar, CloudRain, Wind } from 'lucide-react';
import { AQI_THEMES } from '../constants/config';

const ForecastView = ({ forecast, loading }) => {

  if (loading) {
    return (
      <div className="col-span-3 h-64 flex flex-col items-center justify-center bg-white/50 rounded-[2.5rem]">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-2" />
        <p className="text-slate-400 font-bold">Analyzing 5-day trends...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in">
      {forecast && forecast.length > 0 ? forecast.map((day, idx) => {
        const theme = AQI_THEMES[day.aqi] || AQI_THEMES[1];

        return (
          <div key={idx} className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-white hover:translate-y-[-8px] transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-black-600 font-bold text-md uppercase">Day {idx + 1}</p>
                <h4 className="text-lg font-black text-slate-900">{day.date}</h4>
              </div>
              <div className={`${theme.color} p-2.5 rounded-2xl text-white shadow-lg`}>
                <Wind size={20} />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-6xl font-black ${theme.textColor}`}>{day.aqi}</span>
              <span className="text-slate-400 font-bold text-sm">Index</span>
            </div>

            <div className="mb-6">
              <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full text-white ${theme.color} shadow-sm`}>
                {theme.label} Quality
              </span>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-50">
              <p className="text-[9px] uppercase font-black text-slate-300 mb-2">Pollutant Concentrations (μg/m³)</p>
              {Object.entries(day.components).slice(0, 4).map(([key, val]) => (
                <div key={key} className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400 uppercase">{key.replace('_', '.')}</span>
                  <span className="text-slate-800">{val.toFixed(1)}</span>
                </div>
              ))}
            </div>
            {/* AQI Reference Bar - Place this above your footer */}
            <div className="mt-12 px-4 pb-8">
              <div className="max-w-4xl mx-auto bg-white/60 backdrop-blur-sm rounded-[2rem] p-6 shadow-sm border border-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="shrink-0">
                    <h5 className="text-slate-900 font-black text-sm uppercase tracking-wider">AQI Scale</h5>
                    <p className="text-slate-400 text-[10px] font-bold">Health Risk Levels</p>
                  </div>

                  <div className="grid grid-cols-5 gap-2 w-full">
                    {Object.entries(AQI_THEMES).map(([level, theme]) => (
                      <div key={level} className="flex flex-col items-center group">
                        <div className={`w-full h-1.5 ${theme.color} rounded-full mb-2 opacity-80 group-hover:opacity-100 transition-opacity`} />
                        <span className="text-slate-900 font-black text-[10px]">{level}</span>
                        <span className="text-slate-400 font-bold text-[8px] uppercase truncate">{theme.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }) : (
        <div className="col-span-3 h-64 flex flex-col items-center justify-center bg-white/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
          <Calendar className="text-slate-200 mb-2" size={40} />
          <p className="text-slate-400 font-bold">No forecast data available</p>
        </div>
      )}
    </div>
  );
};

export default ForecastView;