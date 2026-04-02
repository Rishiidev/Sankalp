import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, PlayCircle, PauseCircle } from 'lucide-react';

const CHALISA_VERSES = [
  { type: 'doha', text: "Shri Guru Charan Saroj Raj, Nij Manu Mukuru Sudhari.\nBarnau Raghubar Bimal Jasu, Jo Dayaku Phal Chari.\nBudhi Heen Tanu Janike, Sumirau Pavan Kumar.\nBal Budhi Vidya Dehu Mohi, Harahu Kalesh Bikaar." },
  { type: 'chaupai', num: 1, text: "Jai Hanuman gyan gun sagar.\nJai Kapis tihun lok ujagar." },
  { type: 'chaupai', num: 2, text: "Ram doot atulit bal dhama.\nAnjani putra Pavan sut nama." },
  { type: 'chaupai', num: 3, text: "Mahavir vikram Bajrangi.\nKumati nivar sumati Ke sangi." },
  { type: 'chaupai', num: 4, text: "Kanchan varan viraj subesa.\nKanan kundal kunchit kesa." },
  { type: 'chaupai', num: 5, text: "Hath vajra aur dhuvaje viraje.\nKandhe moonj janehu saaje." },
  { type: 'chaupai', num: 6, text: "Sankar suvan Kesari nandan.\nTej prataap maha jag vandan." },
  { type: 'chaupai', num: 7, text: "Vidyavaan guni ati chatur.\nRam kaaj karibe ko aatur." },
  { type: 'chaupai', num: 8, text: "Prabhu charitra sunibe ko rasiya.\nRam Lakhan Sita man basiya." },
  { type: 'chaupai', num: 9, text: "Sukshma roop dhari Siyahi dikhava.\nVikat roop dhari Lanka jalava." },
  { type: 'chaupai', num: 10, text: "Bhima roop dhari asur sanghare.\nRamachandra ke kaaj sanvare." },
  { type: 'chaupai', num: 11, text: "Laye Sanjivan Lakhan jiyaye.\nShri Raghuvir harashi ur laye." },
  { type: 'chaupai', num: 12, text: "Raghupati kinhi bahut badai.\nTum mam priye Bharat-hi sam bhai." },
  { type: 'chaupai', num: 13, text: "Sahas badan tumharo yash gave.\nAsa kahi Shripati kanth lagave." },
  { type: 'chaupai', num: 14, text: "Sankadik Brahmadi Muneesa.\nNarad Sarad sahit Aheesa." },
  { type: 'chaupai', num: 15, text: "Yam Kuber Digpal jahan te.\nKavi kovid kahi sake kahan te." },
  { type: 'chaupai', num: 16, text: "Tum upkar Sugreevahin keenha.\nRam milaye rajpad deenha." },
  { type: 'chaupai', num: 17, text: "Tumharo mantra Vibhishan maana.\nLankeshwar bhaye sab jag jana." },
  { type: 'chaupai', num: 18, text: "Yug sahastra yojan par Bhanu.\nLeelyo tahi madhur phal janu." },
  { type: 'chaupai', num: 19, text: "Prabhu mudrika meli mukh mahee.\nJaladhi langhi gaye achraj nahee." },
  { type: 'chaupai', num: 20, text: "Durgam kaaj jagat ke jete.\nSugam anugraha tumhare tete." },
  { type: 'chaupai', num: 21, text: "Ram duware tum rakhvare.\nHot na agya binu paisare." },
  { type: 'chaupai', num: 22, text: "Sab sukh lahai tumhari sarna.\nTum rakshak kahu ko darna." },
  { type: 'chaupai', num: 23, text: "Aapan tej samharo aape.\nTinon lok hank te kanpe." },
  { type: 'chaupai', num: 24, text: "Bhoot pisach nikat nahin aave.\nMahavir jab naam sunave." },
  { type: 'chaupai', num: 25, text: "Nase rog harai sab peera.\nJapat nirantar Hanumat beera." },
  { type: 'chaupai', num: 26, text: "Sankat se Hanuman chhudave.\nMan kram vachan dhyan jo lave." },
  { type: 'chaupai', num: 27, text: "Sab par Ram tapasvee raja.\nTin ke kaaj sakal tum saja." },
  { type: 'chaupai', num: 28, text: "Aur manorath jo koi lave.\nSoi amit jeevan phal pave." },
  { type: 'chaupai', num: 29, text: "Charon yug partap tumhara.\nHai persiddh jagat ujiyara." },
  { type: 'chaupai', num: 30, text: "Sadhu sant ke tum rakhvare.\nAsur nikandan Ram dulare." },
  { type: 'chaupai', num: 31, text: "Ashta siddhi nav nidhi ke data.\nAs var deen Janki mata." },
  { type: 'chaupai', num: 32, text: "Ram rasayan tumhare pasa.\nSada raho Raghupati ke dasa." },
  { type: 'chaupai', num: 33, text: "Tumhare bhajan Ram ko pave.\nJanam janam ke dukh bisrave." },
  { type: 'chaupai', num: 34, text: "Anta kaal Raghubar pur jai.\nJahan janma Hari bhakt kahai." },
  { type: 'chaupai', num: 35, text: "Aur devata chitt na dharai.\nHanumat sei sarv sukh karai." },
  { type: 'chaupai', num: 36, text: "Sankat kate mite sab peera.\nJo sumirai Hanumat balbeera." },
  { type: 'chaupai', num: 37, text: "Jai Jai Jai Hanuman gosain.\nKripa karahu gurudev ki nain." },
  { type: 'chaupai', num: 38, text: "Jo sat baar paath kar koi.\nChhutahi bandi maha sukh hoi." },
  { type: 'chaupai', num: 39, text: "Jo yah padhe Hanuman Chalisa.\nHoye siddhi sakhi Gaureesa." },
  { type: 'chaupai', num: 40, text: "Tulsidas sada Hari chera.\nKeejai nath hriday mahn dera." },
  { type: 'doha', text: "Pavantanaya Sankat Harana, Mangala Murati Roop.\nRam Lakhan Sita Sahita, Hriday Basahu Sur Bhoop." }
];

interface Props {
  onBack: () => void;
}

export function HanumanChalisa({ onBack }: Props) {
  const [activeVerse, setActiveVerse] = useState<number | null>(null);

  return (
    <div className="p-6 h-full flex flex-col pb-32 overflow-y-auto bg-slate-950">
      <header className="pt-8 mb-6 flex items-center">
        <button 
          onClick={onBack}
          className="p-2 mr-4 bg-slate-900 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-orange-500">Shri Hanuman Chalisa</h1>
          <p className="text-slate-400 mt-1 text-sm">Awaken devotion and inner strength</p>
        </div>
      </header>

      <div className="space-y-6 max-w-2xl mx-auto w-full">
        {CHALISA_VERSES.map((verse, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setActiveVerse(idx === activeVerse ? null : idx)}
            className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 ${
              activeVerse === idx 
                ? 'bg-orange-500/10 border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)]' 
                : 'bg-slate-900/50 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {verse.type === 'doha' ? (
              <div className="text-center">
                <p className="text-xs text-orange-500 font-bold tracking-widest uppercase mb-3">Doha</p>
                <p className={`text-lg leading-loose font-medium whitespace-pre-wrap transition-colors ${activeVerse === idx ? 'text-orange-100' : 'text-slate-300'}`}>
                  {verse.text}
                </p>
              </div>
            ) : (
              <div className="flex items-start">
                <span className={`text-xs font-bold mr-4 mt-1.5 opacity-50 ${activeVerse === idx ? 'text-orange-500' : 'text-slate-500'}`}>
                  {verse.num?.toString().padStart(2, '0')}
                </span>
                <p className={`text-base leading-relaxed whitespace-pre-wrap transition-colors ${activeVerse === idx ? 'text-orange-100' : 'text-slate-300'}`}>
                  {verse.text}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
