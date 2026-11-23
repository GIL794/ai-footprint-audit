// GENERATED from data/benchmarks.json by scripts/build-data.mjs. Do not edit by hand.
window.AI_FOOTPRINT_BENCHMARKS = {
  "schema_version": "1.3.2",
  "last_updated": "2026-11-23",
  "license": "CC-BY-4.0",
  "status_key": {
    "verified": "Checked against the source it names",
    "derived": "Worked out from a published source (see note)",
    "partly_verified": "Only partly checked against a primary source",
    "unverified": "Not yet checked against a primary source",
    "editor_estimate": "The site author's estimate, no published source"
  },
  "modes": {
    "modern": {
      "label": "Google Gemini text prompt (Google's 2025 measurement)",
      "short_label": "Google Gemini, 2025",
      "description": "Google's own reported figures for the median text prompt on its Gemini Apps in May 2025 (company-authored, not independently verified). The energy is measured; the water is worked out from that energy and the previous year's fleet-wide water-use rate, not metered per prompt. It counts the data centre's electricity and on-site cooling water. It leaves out your device, the network, model training and the water used at power plants, so the water figure counts on-site cooling only and is not a minimum for any other request. Other chatbots, image or video requests and long, multi-step requests are not covered.",
      "prompt_wh": 0.24,
      "prompt_wh_status": "verified",
      "prompt_wh_source": "Google, 'Measuring the environmental impact of delivering AI at Google Scale' (2025), median Gemini Apps text prompt",
      "prompt_wh_source_url": "https://arxiv.org/abs/2508.15734",
      "prompt_water_ml": 0.26,
      "prompt_water_status": "verified",
      "prompt_water_source": "Same Google paper, sections 3.3 and 3.4: derived from the energy per prompt times the previous calendar year's fleet-wide cooling water-use rate (1.15 L/kWh), not metered per prompt; median Gemini Apps text prompt (prompt-weighted median across model-level averages)",
      "prompt_water_source_url": "https://arxiv.org/abs/2508.15734",
      "prompt_water_includes_power_plant_water": false
    },
    "conservative": {
      "label": "Older, heavier estimates (ChatGPT-era reports)",
      "short_label": "Older estimates",
      "description": "Energy: 2.9 Wh per ChatGPT request, as stated in the IEA's Electricity 2024 report. Water: the low end of Li et al.'s range for GPT-3 style models, which includes the water used at power plants. This is a different boundary from the Google figure, so the two water numbers are not like for like.",
      "prompt_wh": 2.9,
      "prompt_wh_status": "verified",
      "prompt_wh_source": "IEA, Electricity 2024 (January 2024), page 34: 'OpenAI's ChatGPT (2.9 Wh per request)'. Opened and checked in the report. The passage does not say how the IEA arrived at it, so treat it as a reported older estimate.",
      "prompt_wh_source_url": "https://iea.blob.core.windows.net/assets/6b2fd954-2017-408e-bf08-952fdd62118a/Electricity2024-Analysisandforecastto2026.pdf",
      "prompt_water_ml": 10,
      "prompt_water_status": "derived",
      "prompt_water_source": "Li, Yang, Islam and Ren, 'Making AI Less Thirsty': about 500 mL per 10 to 50 GPT-3 responses, so 10 mL is the low end of that rounded summary (500 / 50), not a minimum across all places: the article's own table lists lower local values (for example about 7 mL for Ireland). The energy figure (IEA, 2.9 Wh) is a different source, so this is a mixed-source scenario. Includes power-plant water.",
      "prompt_water_source_url": "https://cacm.acm.org/sustainability-and-computing/making-ai-less-thirsty/",
      "prompt_water_includes_power_plant_water": true
    }
  },
  "constants": {
    "burger_water_l": {
      "value": 2310,
      "unit": "L",
      "label": "Water to make one beef burger (150 g of raw beef)",
      "scope": "Blue + green + grey water footprint. About 94% is rainwater taken up by feed crops and grass (green water). Not the same kind of water as the AI cooling-water figure, so the page does not compare them.",
      "source": "Mekonnen & Hoekstra (2012): global average beef 15,400 L per kg, times 0.15 kg",
      "source_url": "https://tools.waterfootprint.org/product-gallery/details.php?product=3",
      "status": "derived"
    },
    "burger_co2e_kg": {
      "value": 14.922,
      "unit": "kg CO2e",
      "label": "Carbon to make one beef burger from beef herds (150 g of raw beef)",
      "scope": "Farm to shop, per kg of raw beef. Prepared weight and cooking are not included.",
      "source": "Poore & Nemecek (2018) via Our World in Data: beef from beef herds 99.48 kg CO2e per kg, times 0.15 kg",
      "source_url": "https://ourworldindata.org/grapher/ghg-per-kg-poore.csv?csvType=full&useColumnShortNames=true&v=1",
      "status": "derived",
      "note": "This is the figure for beef from dedicated beef herds. Beef from dairy herds is much lower (next row). Which one applies depends on where the beef comes from, so the page lets you switch and shows both. No average of the two is used."
    },
    "streaming_hd_wh_per_hr": {
      "value": 77,
      "unit": "Wh",
      "label": "One hour of video streaming (typical Netflix viewing, 2019)",
      "scope": "Data centre (5%), network (23%) and your viewing device (72%) on average. It depends strongly on the device: a phone uses far less than a large TV. This covers much more than the AI prompt figure does.",
      "source": "IEA, 'The carbon footprint of streaming video: fact-checking the headlines' (10 Dec 2020): 'around 0.077 kWh of electricity per hour' in 2019. Opened and checked.",
      "source_url": "https://www.iea.org/commentaries/the-carbon-footprint-of-streaming-video-fact-checking-the-headlines",
      "status": "verified",
      "note": "Not specific to HD. A 2019 figure for typical viewing; the IEA's own page says the result is highly sensitive to device, network and resolution."
    },
    "google_search_wh": {
      "value": 0.3,
      "unit": "Wh",
      "label": "One ordinary web search (2009 figure)",
      "scope": "Google's own servers, 2009. Not the same boundary as the 2025 AI prompt figure.",
      "source": "Google blog, January 2009: 0.0003 kWh per search",
      "source_url": "https://googleblog.blogspot.com/2009/01/powering-google-search.html",
      "status": "verified"
    },
    "grid_carbon_intensity_g_per_kwh": {
      "value": 458,
      "unit": "g CO2e/kWh",
      "label": "World average electricity carbon intensity, 2025",
      "scope": "Global power sector average, used to turn the AI and video electricity into a scenario carbon figure. Per Ember it covers life-cycle emissions of electricity generation, not losses in delivery to users and not the life cycle of AI hardware or training. Individual countries differ a lot, and Google's own reported emissions are not used here.",
      "source": "Ember, Global Electricity Review 2026: 458 g CO2e/kWh in 2025 (471 in 2024)",
      "source_url": "https://ember-energy.org/app/uploads/2026/04/Global-Electricity-Review-2026.pdf",
      "status": "verified",
      "note": "Scenario input. The AI carbon on the page is electricity multiplied by this world average. It is not part of Google's measurement."
    },
    "efficiency_gain_factor": {
      "value": 33,
      "unit": "times",
      "label": "Fall in energy per median Gemini text prompt over 12 months",
      "scope": "Google's own prompt, one company, one year",
      "source": "Google blog, August 2025: energy fell 33x and carbon 44x over a recent 12 month period",
      "source_url": "https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference",
      "status": "verified"
    },
    "google_electricity_twh": [
      {
        "year": "2023",
        "twh": 24.99,
        "note": "Google's total electricity use"
      },
      {
        "year": "2024",
        "twh": 31.71,
        "note": "Google's total electricity use"
      },
      {
        "year": "2025",
        "twh": 43.59,
        "note": "Up 37% on 2024"
      }
    ],
    "google_electricity_source": "Google 2026 Environmental Report, data table",
    "google_electricity_source_url": "https://sustainability.google/files/google-2026-environmental-report.pdf",
    "global_dc_twh": [
      {
        "year": "2024",
        "twh": 415,
        "note": "All data centres worldwide (IEA)"
      },
      {
        "year": "2030 (projection)",
        "twh": 945,
        "note": "IEA base case"
      }
    ],
    "global_dc_source": "IEA, Energy and AI (2025)",
    "global_dc_source_url": "https://www.iea.org/reports/energy-and-ai",
    "burger_co2e_dairy_kg": {
      "value": 4.995,
      "unit": "kg CO2e",
      "label": "Carbon to make one beef burger from dairy herds (150 g of raw beef)",
      "scope": "Farm to shop, per kg of raw beef. Prepared weight and cooking are not included.",
      "source": "Poore & Nemecek (2018) via Our World in Data: beef from dairy herds 33.3 kg CO2e per kg, times 0.15 kg",
      "source_url": "https://ourworldindata.org/grapher/ghg-per-kg-poore.csv?csvType=full&useColumnShortNames=true&v=1",
      "status": "derived",
      "note": "Beef that is a by-product of milk production. Shown as the lower published figure."
    }
  },
  "removed_figures": [
    {
      "figure": "Burger carbon midpoint (9.96 kg)",
      "why": "An average of two different farming systems is not a representative average of the world's beef. Both published figures are now shown separately."
    },
    {
      "figure": "Power-plant water factor (1.8 L per kWh)",
      "why": "No single published figure matched to the global grid was verified. Removed. Streaming water is no longer estimated, and the Google water figure is stated as on-site only."
    },
    {
      "figure": "World livestock blue water (228 km3 a year)",
      "why": "The figure could not be traced to a source (Mekonnen & Hoekstra give a different total). Removed along with its comparison."
    },
    {
      "figure": "AI data centre water 2028 (1.07 km3 a year)",
      "why": "Not found in the paper it was attributed to. Removed along with its comparison."
    },
    {
      "figure": "Training and hardware allowance (0.08 and 0.45 Wh; 0.6 and 2.2 mL)",
      "why": "No published source. Removed. The page says plainly that training and hardware are not counted."
    },
    {
      "figure": "Burger energy (12 kWh)",
      "why": "No source. Removed earlier."
    },
    {
      "figure": "Author's plausible ranges on every constant",
      "why": "They were the site author's bounds, not published intervals, and could be read as confidence intervals. Removed. Any uncertainty is now described in words."
    },
    {
      "figure": "AI water compared with burger water (ratios and shares)",
      "why": "On-site cooling water and a whole agricultural water footprint (mostly rain) are different quantities. The page now shows them separately with no ratio."
    }
  ]
};
