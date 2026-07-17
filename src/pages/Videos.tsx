import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Sparkles, CheckCircle2, Clock, DollarSign, Play, Lock, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BottomNav from '../components/BottomNav';

interface LevelData {
  id: string;
  task_payment: number;
  daily_tasks: number;
}

interface ProgressData {
  nivel_activo: string;
  videos_vistos_hoy: number;
  videos_fecha: string;
  saldo_ingresos: number;
  ganancias_hoy: number;
  ganancias_mes: number;
  ganancias_semana: number;
  ingresos_totales: number;
  pasantia_completada: boolean;
}

const MOCK_VIDEOS = [
  { id: 1, title: 'Introducción a la plataforma', duration: '2:30' },
  { id: 2, title: 'Cómo generar ingresos diarios', duration: '3:15' },
  { id: 3, title: 'Estrategias de inversión segura', duration: '4:00' },
  { id: 4, title: 'Consejos de expertos financieros', duration: '2:45' },
  { id: 5, title: 'Tutorial de retiros', duration: '3:30' },
  { id: 6, title: 'Historias de éxito', duration: '5:00' },
  { id: 7, title: 'Planificación financiera', duration: '3:45' },
  { id: 8, title: 'Diversificación de ingresos', duration: '4:20' },
  { id: 9, title: 'Análisis de mercado diario', duration: '2:50' },
  { id: 10, title: 'Rendimiento y métricas clave', duration: '3:10' },
  { id: 11, title: 'Gestión de riesgo financiero', duration: '4:15' },
  { id: 12, title: 'Oportunidades de crecimiento', duration: '3:25' },
  { id: 13, title: 'Optimización de ganancias', duration: '4:40' },
  { id: 14, title: 'Tendencias del mercado actual', duration: '3:55' },
  { id: 15, title: 'Estrategias avanzadas de inversión', duration: '5:10' },
  { id: 16, title: 'Fundamentos del trading moderno', duration: '4:05' },
  { id: 17, title: 'Análisis técnico paso a paso', duration: '3:50' },
  { id: 18, title: 'Gestión de portafolios', duration: '4:30' },
  { id: 19, title: 'Psicología del inversor', duration: '3:20' },
  { id: 20, title: 'Mercados emergentes', duration: '4:50' },
  { id: 21, title: 'Inversión a largo plazo', duration: '3:35' },
  { id: 22, title: 'Compound interest explained', duration: '4:10' },
  { id: 23, title: ' hedge funds y alternativas', duration: '3:40' },
  { id: 24, title: 'Macroeconomía para inversores', duration: '5:05' },
  { id: 25, title: 'Indicadores económicos clave', duration: '3:00' },
  { id: 26, title: 'Flujos de caja y valoración', duration: '4:25' },
  { id: 27, title: 'Renta fija vs renta variable', duration: '3:30' },
  { id: 28, title: 'Criptomonedas y blockchain', duration: '4:45' },
  { id: 29, title: 'Fondos indexados y ETFs', duration: '3:15' },
  { id: 30, title: 'Plan de jubilación e inversión', duration: '4:55' },
  { id: 31, title: 'Análisis fundamental avanzado', duration: '4:20' },
  { id: 32, title: 'Gestión de riesgos en portafolios', duration: '3:50' },
  { id: 33, title: 'Inversión en bienes raíces', duration: '5:15' },
  { id: 34, title: 'Dividendos y recompensas accionarias', duration: '3:40' },
  { id: 35, title: 'Trading algorítmico introductorio', duration: '4:35' },
  { id: 36, title: 'Volatilidad y opciones', duration: '4:10' },
  { id: 37, title: 'Value investing profundización', duration: '5:00' },
  { id: 38, title: 'Arbitraje y oportunidades de mercado', duration: '3:25' },
  { id: 39, title: 'Inversión socialmente responsable', duration: '4:45' },
  { id: 40, title: 'Fondos de cobertura explicados', duration: '3:55' },
  { id: 41, title: 'Mercados de futuros y derivados', duration: '4:30' },
  { id: 42, title: 'Estrategias de bajo riesgo', duration: '3:15' },
  { id: 43, title: 'Capital de riesgo y startups', duration: '5:05' },
  { id: 44, title: 'Ingresos pasivos reales', duration: '4:00' },
  { id: 45, title: 'Diversificación geográfica', duration: '3:35' },
  { id: 46, title: 'Análisis de estados financieros', duration: '4:50' },
  { id: 47, title: 'Ciclos económicos y timing', duration: '3:45' },
  { id: 48, title: 'Inversión en materias primas', duration: '4:25' },
  { id: 49, title: 'Inteligencia artificial en finanzas', duration: '5:20' },
  { id: 50, title: 'Construyendo legado financiero', duration: '4:40' },
  { id: 51, title: 'Estrategias de alto rendimiento', duration: '4:15' },
  { id: 52, title: 'Gestión de grandes portafolios', duration: '5:25' },
  { id: 53, title: 'Inversión institucional explicada', duration: '4:50' },
  { id: 54, title: 'Modelos de valoración avanzados', duration: '4:05' },
  { id: 55, title: 'Renta fija de alto rendimiento', duration: '3:45' },
  { id: 56, title: 'Opciones y derivados avanzados', duration: '5:10' },
  { id: 57, title: 'Cobertura cambiaria', duration: '4:20' },
  { id: 58, title: 'Inversión en infraestructura', duration: '3:55' },
  { id: 59, title: 'Private equity desmitificado', duration: '4:35' },
  { id: 60, title: 'Fondos soberanos y pensiones', duration: '5:00' },
  { id: 61, title: 'Macroestrategias globales', duration: '4:25' },
  { id: 62, title: ' commodities y materias primas', duration: '3:40' },
  { id: 63, title: 'Inversión en metales preciosos', duration: '4:10' },
  { id: 64, title: 'Energía y mercados de carbono', duration: '4:55' },
  { id: 65, title: 'Fintech y disrupción financiera', duration: '3:30' },
  { id: 66, title: 'DeFi y finanzas descentralizadas', duration: '5:15' },
  { id: 67, title: 'Tokenización de activos', duration: '4:45' },
  { id: 68, title: 'Crowdfunding y inversión colectiva', duration: '3:20' },
  { id: 69, title: 'Análisis cuantitativo aplicado', duration: '4:30' },
  { id: 70, title: 'Machine learning en trading', duration: '5:05' },
  { id: 71, title: 'Gestión de drawdown y pérdida', duration: '3:50' },
  { id: 72, title: 'Psicología del trading avanzada', duration: '4:00' },
  { id: 73, title: 'Mesa de dinero y liquidez', duration: '4:40' },
  { id: 74, title: 'Arbitraje estadístico', duration: '3:35' },
  { id: 75, title: 'Inversión en arte y coleccionables', duration: '4:15' },
  { id: 76, title: 'Finanzas familiares y sucesión', duration: '5:20' },
  { id: 77, title: 'Optimización fiscal para inversores', duration: '4:25' },
  { id: 78, title: 'Fideicomisos y estructuras legales', duration: '3:55' },
  { id: 79, title: 'Filantropía estratégica', duration: '4:50' },
  { id: 80, title: 'Maestría financiera integral', duration: '5:30' },
  { id: 81, title: 'Estrategias de wealth management', duration: '4:20' },
  { id: 82, title: 'Family office y gobernanza', duration: '5:10' },
  { id: 83, title: 'Inversión transgeneracional', duration: '4:45' },
  { id: 84, title: 'Macro global y geopolítica', duration: '5:25' },
  { id: 85, title: 'Trading de alta frecuencia', duration: '4:15' },
  { id: 86, title: 'Modelos de Black-Scholes', duration: '4:50' },
  { id: 87, title: 'Griegas y gestión de opciones', duration: '4:30' },
  { id: 88, title: 'Estrategias delta-neutral', duration: '5:00' },
  { id: 89, title: 'Volatility surface trading', duration: '4:40' },
  { id: 90, title: 'Fixed income arbitrage', duration: '4:10' },
  { id: 91, title: 'Convertible bond arbitrage', duration: '4:55' },
  { id: 92, title: 'Capital structure arbitrage', duration: '4:25' },
  { id: 93, title: 'Statistical arbitrage pairs', duration: '5:15' },
  { id: 94, title: 'Mean reversion strategies', duration: '4:35' },
  { id: 95, title: 'Momentum y trend following', duration: '4:05' },
  { id: 96, title: 'Carry trade en Forex', duration: '4:45' },
  { id: 97, title: 'Risk parity y parity volátil', duration: '4:20' },
  { id: 98, title: 'Factor investing profundo', duration: '5:05' },
  { id: 99, title: 'Smart beta y multifactor', duration: '4:30' },
  { id: 100, title: 'ESG investing avanzado', duration: '4:50' },
  { id: 101, title: 'Impact investing medición', duration: '4:15' },
  { id: 102, title: 'Private credit markets', duration: '5:20' },
  { id: 103, title: 'Distressed debt investing', duration: '4:40' },
  { id: 104, title: 'Special situations investing', duration: '4:25' },
  { id: 105, title: 'Merger arbitrage', duration: '4:55' },
  { id: 106, title: 'Event-driven strategies', duration: '4:10' },
  { id: 107, title: 'Activist investing', duration: '5:00' },
  { id: 108, title: 'Pre-IPO y secondary markets', duration: '4:35' },
  { id: 109, title: 'SPACs y de-SPAC process', duration: '4:20' },
  { id: 110, title: 'Real assets y timberland', duration: '4:45' },
  { id: 111, title: 'Agriculture y farmland investing', duration: '5:10' },
  { id: 112, title: 'Water rights investing', duration: '4:30' },
  { id: 113, title: 'Carbon credits markets', duration: '4:15' },
  { id: 114, title: 'Green bonds y sustainability', duration: '4:50' },
  { id: 115, title: 'Catastrophe bonds', duration: '4:25' },
  { id: 116, title: 'Longevity risk transfer', duration: '4:40' },
  { id: 117, title: 'Reinsurance linked investments', duration: '5:05' },
  { id: 118, title: 'Litigation finance', duration: '4:20' },
  { id: 119, title: 'Royalty financing', duration: '4:35' },
  { id: 120, title: 'Revenue-based financing', duration: '4:50' },
  { id: 121, title: 'Venture debt mechanics', duration: '4:10' },
  { id: 122, title: 'Bridge financing y mezzanine', duration: '4:45' },
  { id: 123, title: 'Leveraged buyouts explicados', duration: '5:15' },
  { id: 124, title: 'Recapitalizations', duration: '4:25' },
  { id: 125, title: 'Dividend recaps', duration: '4:30' },
  { id: 126, title: 'Workout investing', duration: '4:55' },
  { id: 127, title: 'Chapter 11 investing', duration: '4:40' },
  { id: 128, title: 'Claims trading', duration: '4:15' },
  { id: 129, title: 'Post-reorg equity', duration: '4:50' },
  { id: 130, title: 'M&A arbitrage avanzado', duration: '5:00' },
  { id: 131, title: 'Spin-off investing', duration: '4:20' },
  { id: 132, title: 'Carve-outs y tracking stocks', duration: '4:35' },
  { id: 133, title: 'Rights offerings', duration: '4:45' },
  { id: 134, title: 'PIPEs y registered directs', duration: '4:10' },
  { id: 135, title: 'Follow-on offerings', duration: '4:30' },
  { id: 136, title: 'Block trades y dark pools', duration: '4:55' },
  { id: 137, title: 'Algorithmic execution', duration: '5:05' },
  { id: 138, title: 'VWAP y TWAP strategies', duration: '4:25' },
  { id: 139, title: 'Implementation shortfall', duration: '4:40' },
  { id: 140, title: 'Market making y liquidity', duration: '4:15' },
  { id: 141, title: 'Order book dynamics', duration: '4:50' },
  { id: 142, title: 'Microstructure y price impact', duration: '4:35' },
  { id: 143, title: 'Latency arbitrage', duration: '4:20' },
  { id: 144, title: 'Order flow trading', duration: '4:45' },
  { id: 145, title: 'Sentiment analysis con NLP', duration: '5:10' },
  { id: 146, title: 'Alternative data en trading', duration: '4:30' },
  { id: 147, title: 'Satellite data y commodities', duration: '4:55' },
  { id: 148, title: 'Web scraping para señales', duration: '4:15' },
  { id: 149, title: 'Backtesting riguroso', duration: '4:40' },
  { id: 150, title: 'Cierre de maestría: visión integral', duration: '5:25' },
  { id: 151, title: 'Quantitative finance deep dive', duration: '4:37' },
  { id: 152, title: 'Stochastic calculus primer', duration: '5:44' },
  { id: 153, title: 'Ito lemma applications', duration: '3:51' },
  { id: 154, title: 'Black-Derman-Toy model', duration: '4:58' },
  { id: 155, title: 'Heath-Jarrow-Morton framework', duration: '5:05' },
  { id: 156, title: 'LIBOR market model', duration: '3:12' },
  { id: 157, title: 'Brace-Gatarek-Musiela model', duration: '4:19' },
  { id: 158, title: 'SABR volatility model', duration: '5:26' },
  { id: 159, title: 'Local volatility surfaces', duration: '3:33' },
  { id: 160, title: 'Heston model calibration', duration: '4:40' },
  { id: 161, title: 'Jump-diffusion processes', duration: '5:47' },
  { id: 162, title: 'Variance gamma models', duration: '3:54' },
  { id: 163, title: 'Stochastic volatility models', duration: '4:01' },
  { id: 164, title: 'Rough volatility theory', duration: '5:08' },
  { id: 165, title: 'Fractional Brownian motion', duration: '3:15' },
  { id: 166, title: 'Options on futures', duration: '4:22' },
  { id: 167, title: 'Asian options pricing', duration: '5:29' },
  { id: 168, title: 'Barrier options engineering', duration: '3:36' },
  { id: 169, title: 'Lookback options strategies', duration: '4:43' },
  { id: 170, title: 'Cliquet and mountain options', duration: '5:50' },
  { id: 171, title: 'Digital and binary options', duration: '3:57' },
  { id: 172, title: 'Compound options', duration: '4:04' },
  { id: 173, title: 'Chooser and forward start options', duration: '5:11' },
  { id: 174, title: 'Rainbow and basket options', duration: '3:18' },
  { id: 175, title: 'Quantos and exchange options', duration: '4:25' },
  { id: 176, title: 'Spread options trading', duration: '5:32' },
  { id: 177, title: 'Volatility swaps', duration: '3:39' },
  { id: 178, title: 'Variance swaps mechanics', duration: '4:46' },
  { id: 179, title: 'Correlation swaps', duration: '5:53' },
  { id: 180, title: 'Dividend swaps and futures', duration: '3:00' },
  { id: 181, title: 'Inflation derivatives', duration: '4:07' },
  { id: 182, title: 'Weather derivatives', duration: '5:14' },
  { id: 183, title: 'Real estate derivatives', duration: '3:21' },
  { id: 184, title: 'Shipping and freight derivatives', duration: '4:28' },
  { id: 185, title: 'Emission derivatives', duration: '5:35' },
  { id: 186, title: 'Macro futures spreads', duration: '3:42' },
  { id: 187, title: 'Term structure modeling', duration: '4:49' },
  { id: 188, title: 'Nelson-Siegel-Svensson', duration: '5:56' },
  { id: 189, title: 'Splines and parameterizations', duration: '3:03' },
  { id: 190, title: 'Yield curve stripping', duration: '4:10' },
  { id: 191, title: 'OIS discounting', duration: '5:17' },
  { id: 192, title: 'CSA and collateralization', duration: '3:24' },
  { id: 193, title: 'XVA: CVA, DVA, FVA, MVA', duration: '4:31' },
  { id: 194, title: 'Counterparty risk pricing', duration: '5:38' },
  { id: 195, title: 'Wrong-way risk modeling', duration: '3:45' },
  { id: 196, title: 'Initial margin and SIMM', duration: '4:52' },
  { id: 197, title: 'Adverse selection in markets', duration: '5:59' },
  { id: 198, title: 'Toxicity and order flow', duration: '3:06' },
  { id: 199, title: 'Knight-Friedman models', duration: '4:13' },
  { id: 200, title: 'Garman-Klass volatility', duration: '5:20' },
  { id: 201, title: 'Yang-Zhang range estimators', duration: '3:27' },
  { id: 202, title: 'HAR-RV volatility forecasting', duration: '4:34' },
  { id: 203, title: 'GARCH family models', duration: '5:41' },
  { id: 204, title: 'EGARCH and TGARCH', duration: '3:48' },
  { id: 205, title: 'Stochastic volatility forecasting', duration: '4:55' },
  { id: 206, title: 'Implied volatility surfaces', duration: '5:02' },
  { id: 207, title: 'Smile and skew dynamics', duration: '3:09' },
  { id: 208, title: 'Risk-neutral density estimation', duration: '4:16' },
  { id: 209, title: 'Breeden-Litzenberger', duration: '5:23' },
  { id: 210, title: 'Butterfly and risk reversals', duration: '3:30' },
  { id: 211, title: 'Volatility risk premium', duration: '4:37' },
  { id: 212, title: 'Dispersion trading', duration: '5:44' },
  { id: 213, title: 'Index arbitrage mechanics', duration: '3:51' },
  { id: 214, title: 'Portfolio insurance and CPPI', duration: '4:58' },
  { id: 215, title: 'Constant proportion strategies', duration: '5:05' },
  { id: 216, title: 'Dynamic hedging', duration: '3:12' },
  { id: 217, title: 'Delta hedging frictions', duration: '4:19' },
  { id: 218, title: 'Gamma scalping', duration: '5:26' },
  { id: 219, title: 'Vega and vanna exposure', duration: '3:33' },
  { id: 220, title: 'Charm and color greeks', duration: '4:40' },
  { id: 221, title: 'Vomma and ultima greeks', duration: '5:47' },
  { id: 222, title: 'Shadow greeks overview', duration: '3:54' },
  { id: 223, title: 'Scenario analysis and stress', duration: '4:01' },
  { id: 224, title: 'Historical VaR and ES', duration: '5:08' },
  { id: 225, title: 'Parametric VaR models', duration: '3:15' },
  { id: 226, title: 'Monte Carlo VaR', duration: '4:22' },
  { id: 227, title: 'Copulas in risk management', duration: '5:29' },
  { id: 228, title: 'Gaussian vs t-copula', duration: '3:36' },
  { id: 229, title: 'Clayton and Gumbel copulas', duration: '4:43' },
  { id: 230, title: 'Tail dependence modeling', duration: '5:50' },
  { id: 231, title: 'Extreme value theory', duration: '3:57' },
  { id: 232, title: 'Peaks-over-threshold method', duration: '4:04' },
  { id: 233, title: 'Generalized Pareto distribution', duration: '5:11' },
  { id: 234, title: 'Block maxima approach', duration: '3:18' },
  { id: 235, title: 'Backtesting VaR models', duration: '4:25' },
  { id: 236, title: 'Expected shortfall backtesting', duration: '5:32' },
  { id: 237, title: 'FRTB and capital requirements', duration: '3:39' },
  { id: 238, title: 'Basel III overview', duration: '4:46' },
  { id: 239, title: 'Liquidity coverage ratio', duration: '5:53' },
  { id: 240, title: 'Net stable funding ratio', duration: '3:00' },
  { id: 241, title: 'Stress testing frameworks', duration: '4:07' },
  { id: 242, title: 'Reverse stress testing', duration: '5:14' },
  { id: 243, title: 'CCAR and DFAST', duration: '3:21' },
  { id: 244, title: 'ICAAP and capital planning', duration: '4:28' },
  { id: 245, title: 'SR 11-7 model risk', duration: '5:35' },
  { id: 246, title: 'Three lines of defense', duration: '3:42' },
  { id: 247, title: 'Risk culture and governance', duration: '4:49' },
  { id: 248, title: 'Operational risk modeling', duration: '5:56' },
  { id: 249, title: 'AMA and SMA approaches', duration: '3:03' },
  { id: 250, title: 'Key risk indicators', duration: '4:10' },
  { id: 251, title: 'Advanced portfolio theory', duration: '5:23' },
  { id: 252, title: 'Black-Litterman model', duration: '3:36' },
  { id: 253, title: 'Resampled efficient frontier', duration: '4:49' },
  { id: 254, title: 'Post-modern portfolio theory', duration: '5:02' },
  { id: 255, title: 'Conditional value at risk', duration: '3:15' },
  { id: 256, title: 'Drawdown-based optimization', duration: '4:28' },
  { id: 257, title: 'Regime-switching models', duration: '5:41' },
  { id: 258, title: 'Hidden Markov in finance', duration: '3:54' },
  { id: 259, title: 'State-space models', duration: '4:07' },
  { id: 260, title: 'Kalman filtering in trading', duration: '5:20' },
  { id: 261, title: 'Particle filtering methods', duration: '3:33' },
  { id: 262, title: 'Bayesian inference finance', duration: '4:46' },
  { id: 263, title: 'Bayesian portfolio allocation', duration: '5:59' },
  { id: 264, title: 'Black-Litterman with views', duration: '3:12' },
  { id: 265, title: 'Robust optimization', duration: '4:25' },
  { id: 266, title: 'Worst-case optimization', duration: '5:38' },
  { id: 267, title: 'Distributionally robust', duration: '3:51' },
  { id: 268, title: 'Wasserstein distance methods', duration: '4:04' },
  { id: 269, title: 'Machine learning in asset pricing', duration: '5:17' },
  { id: 270, title: 'Deep learning for trading', duration: '3:30' },
  { id: 271, title: 'Reinforcement trading', duration: '4:43' },
  { id: 272, title: 'Natural language in finance', duration: '5:56' },
  { id: 273, title: 'Transformer models for time series', duration: '3:09' },
  { id: 274, title: 'Attention mechanisms trading', duration: '4:22' },
  { id: 275, title: 'Graph neural networks finance', duration: '5:35' },
  { id: 276, title: 'Generative adversarial markets', duration: '3:48' },
  { id: 277, title: 'Diffusion models finance', duration: '4:01' },
  { id: 278, title: 'Autoencoders for anomaly detection', duration: '5:14' },
  { id: 279, title: 'Clustering market regimes', duration: '3:27' },
  { id: 280, title: 'Support vector machines', duration: '4:40' },
  { id: 281, title: 'Random forests in finance', duration: '5:53' },
  { id: 282, title: 'Gradient boosting trading', duration: '3:06' },
  { id: 283, title: 'XGBoost for alpha', duration: '4:19' },
  { id: 284, title: 'LightGBM in finance', duration: '5:32' },
  { id: 285, title: 'CatBoost for finance', duration: '3:45' },
  { id: 286, title: 'Ensemble methods trading', duration: '4:58' },
  { id: 287, title: 'Feature engineering finance', duration: '5:11' },
  { id: 288, title: 'Feature selection alpha', duration: '3:24' },
  { id: 289, title: 'Dimensionality reduction PCA', duration: '4:37' },
  { id: 290, title: 'Factor analysis finance', duration: '5:50' },
  { id: 291, title: 'Independent component analysis', duration: '3:03' },
  { id: 292, title: 'Non-negative matrix factorization', duration: '4:16' },
  { id: 293, title: 'Topological data analysis', duration: '5:29' },
  { id: 294, title: 'Information theory trading', duration: '3:42' },
  { id: 295, title: 'Mutual information features', duration: '4:55' },
  { id: 296, title: 'Entropy-based indicators', duration: '5:08' },
  { id: 297, title: 'Transfer entropy markets', duration: '3:21' },
  { id: 298, title: 'Granger causality testing', duration: '4:34' },
  { id: 299, title: 'Cointegration tests', duration: '5:47' },
  { id: 300, title: 'Johansen test procedure', duration: '3:00' },
  { id: 301, title: 'Engle-Granger two-step', duration: '4:13' },
  { id: 302, title: 'Error correction models', duration: '5:26' },
  { id: 303, title: 'Vector autoregression', duration: '3:39' },
  { id: 304, title: 'Structural VAR models', duration: '4:52' },
  { id: 305, title: 'Bayesian VAR models', duration: '5:05' },
  { id: 306, title: 'Time-varying parameter VAR', duration: '3:18' },
  { id: 307, title: 'Factor-augmented VAR', duration: '4:31' },
  { id: 308, title: 'Dynamic factor models', duration: '5:44' },
  { id: 309, title: 'Nowcasting macro indicators', duration: '3:57' },
  { id: 310, title: 'Mixed-frequency models', duration: '4:10' },
  { id: 311, title: 'MIDAS regression models', duration: '5:23' },
  { id: 312, title: 'Unobserved components models', duration: '3:36' },
  { id: 313, title: 'Trend-cycle decomposition', duration: '4:49' },
  { id: 314, title: 'Seasonal adjustment methods', duration: '5:02' },
  { id: 315, title: 'X-13ARIMA-SEATS', duration: '3:15' },
  { id: 316, title: 'TRAMO-SEATS decomposition', duration: '4:28' },
  { id: 317, title: 'State-space trend extraction', duration: '5:41' },
  { id: 318, title: 'Unobserved components VEC', duration: '3:54' },
  { id: 319, title: 'Dynamic stochastic general equilibrium', duration: '4:07' },
  { id: 320, title: 'DSGE estimation methods', duration: '5:20' },
  { id: 321, title: 'Impulse response analysis', duration: '3:33' },
  { id: 322, title: 'Variance decomposition', duration: '4:46' },
  { id: 323, title: 'Historical decomposition', duration: '5:59' },
  { id: 324, title: 'Counterfactual analysis', duration: '3:12' },
  { id: 325, title: 'Structural shocks identification', duration: '4:25' },
  { id: 326, title: 'External instrument identification', duration: '5:38' },
  { id: 327, title: 'Proxy SVAR models', duration: '3:51' },
  { id: 328, title: 'High-frequency identification', duration: '4:04' },
  { id: 329, title: 'Local projections method', duration: '5:17' },
  { id: 330, title: 'Panel data econometrics', duration: '3:30' },
  { id: 331, title: 'Fixed effects models', duration: '4:43' },
  { id: 332, title: 'Random effects models', duration: '5:56' },
  { id: 333, title: 'Difference-in-differences', duration: '3:09' },
  { id: 334, title: 'Synthetic control method', duration: '4:22' },
  { id: 335, title: 'Regression discontinuity', duration: '5:35' },
  { id: 336, title: 'Instrumental variables', duration: '3:48' },
  { id: 337, title: 'Two-stage least squares', duration: '4:01' },
  { id: 338, title: 'GMM estimation', duration: '5:14' },
  { id: 339, title: 'Simulated method of moments', duration: '3:27' },
  { id: 340, title: 'Indirect inference', duration: '4:40' },
  { id: 341, title: 'Maximum likelihood finance', duration: '5:53' },
  { id: 342, title: 'Quasi-maximum likelihood', duration: '3:06' },
  { id: 343, title: 'Generalized error distribution', duration: '4:19' },
  { id: 344, title: 'Student-t distribution finance', duration: '5:32' },
  { id: 345, title: 'Skewed distributions', duration: '3:45' },
  { id: 346, title: 'Mixture distributions', duration: '4:58' },
  { id: 347, title: 'Regime-switching volatility', duration: '5:11' },
  { id: 348, title: 'GARCH-M models', duration: '3:24' },
  { id: 349, title: 'FIGARCH and HYGARCH', duration: '4:37' },
  { id: 350, title: 'Long memory volatility', duration: '5:50' },
  { id: 351, title: 'Realized volatility models', duration: '3:03' },
  { id: 352, title: 'Realized kernel estimator', duration: '4:16' },
  { id: 353, title: 'Realized bipower variation', duration: '5:29' },
  { id: 354, title: 'Jump detection methods', duration: '3:42' },
  { id: 355, title: 'Pre-averaging estimator', duration: '4:55' },
  { id: 356, title: 'Two-scale realized variance', duration: '5:08' },
  { id: 357, title: 'Microstructure noise', duration: '3:21' },
  { id: 358, title: 'Noise-robust volatility', duration: '4:34' },
  { id: 359, title: 'Kernel-based estimators', duration: '5:47' },
  { id: 360, title: 'Fourier-based volatility', duration: '3:00' },
  { id: 361, title: 'Wavelet decomposition finance', duration: '4:13' },
  { id: 362, title: 'Multi-resolution analysis', duration: '5:26' },
  { id: 363, title: 'Wavelet coherence', duration: '3:39' },
  { id: 364, title: 'Cross-wavelet transform', duration: '4:52' },
  { id: 365, title: 'Partial wavelet coherence', duration: '5:05' },
  { id: 366, title: 'Multiple wavelet coherence', duration: '3:18' },
  { id: 367, title: 'Wavelet-based causality', duration: '4:31' },
  { id: 368, title: 'Complex wavelet transform', duration: '5:44' },
  { id: 369, title: 'Dual-tree complex wavelet', duration: '3:57' },
  { id: 370, title: 'Stationary wavelet transform', duration: '4:10' },
  { id: 371, title: 'Maximal overlap DWT', duration: '5:23' },
  { id: 372, title: 'Wavelet packet decomposition', duration: '3:36' },
  { id: 373, title: 'Best basis selection', duration: '4:49' },
  { id: 374, title: 'Adaptive wavelet methods', duration: '5:02' },
  { id: 375, title: 'Lifting wavelet scheme', duration: '3:15' },
  { id: 376, title: 'Second generation wavelets', duration: '4:28' },
  { id: 377, title: 'Curvelet transform finance', duration: '5:41' },
  { id: 378, title: 'Ridgelet transform finance', duration: '3:54' },
  { id: 379, title: 'Contourlet transform', duration: '4:07' },
  { id: 380, title: 'Shearlet transform methods', duration: '5:20' },
  { id: 381, title: 'Directional filter banks', duration: '3:33' },
  { id: 382, title: 'Steerable pyramid transform', duration: '4:46' },
  { id: 383, title: 'Orientation-adaptive filtering', duration: '5:59' },
  { id: 384, title: 'Anisotropic diffusion finance', duration: '3:12' },
  { id: 385, title: 'Total variation denoising', duration: '4:25' },
  { id: 386, title: 'Non-local means denoising', duration: '5:38' },
  { id: 387, title: 'BM3D filtering finance', duration: '3:51' },
  { id: 388, title: 'Dictionary learning signals', duration: '4:04' },
  { id: 389, title: 'Sparse coding finance', duration: '5:17' },
  { id: 390, title: 'Compressed sensing finance', duration: '3:30' },
  { id: 391, title: 'Restricted isometry property', duration: '4:43' },
  { id: 392, title: 'L1 minimization finance', duration: '5:56' },
  { id: 393, title: 'LASSO regression finance', duration: '3:09' },
  { id: 394, title: 'Elastic net regularization', duration: '4:22' },
  { id: 395, title: 'Group LASSO methods', duration: '5:35' },
  { id: 396, title: 'Fused LASSO finance', duration: '3:48' },
  { id: 397, title: 'Trend filtering methods', duration: '4:01' },
  { id: 398, title: 'Isotonic regression finance', duration: '5:14' },
  { id: 399, title: 'Monotone cubic splines', duration: '3:27' },
  { id: 400, title: 'B-spline approximation', duration: '4:40' },
  { id: 401, title: 'Penalized splines finance', duration: '5:53' },
  { id: 402, title: 'Smoothing splines', duration: '3:06' },
  { id: 403, title: 'Tensor product splines', duration: '4:19' },
  { id: 404, title: 'Thin plate splines', duration: '5:32' },
  { id: 405, title: 'Radial basis functions', duration: '3:45' },
  { id: 406, title: 'Kriging and Gaussian processes', duration: '4:58' },
  { id: 407, title: 'Gaussian process regression', duration: '5:11' },
  { id: 408, title: 'Gaussian process classification', duration: '3:24' },
  { id: 409, title: 'Gaussian process latent variable', duration: '4:37' },
  { id: 410, title: 'Deep Gaussian processes', duration: '5:50' },
  { id: 411, title: 'Variational Gaussian processes', duration: '3:03' },
  { id: 412, title: 'Sparse Gaussian processes', duration: '4:16' },
  { id: 413, title: 'Inducing point methods', duration: '5:29' },
  { id: 414, title: 'Stochastic variational GP', duration: '3:42' },
  { id: 415, title: 'Deep kernel learning', duration: '4:55' },
  { id: 416, title: 'Neural process models', duration: '5:08' },
  { id: 417, title: 'Attentive neural process', duration: '3:21' },
  { id: 418, title: 'Conditional neural process', duration: '4:34' },
  { id: 419, title: 'Graph neural process', duration: '5:47' },
  { id: 420, title: 'Transformer neural process', duration: '3:00' },
  { id: 421, title: 'Set transformer models', duration: '4:13' },
  { id: 422, title: 'Deep sets architecture', duration: '5:26' },
  { id: 423, title: 'Point cloud finance', duration: '3:39' },
  { id: 424, title: 'Geometric deep learning', duration: '4:52' },
  { id: 425, title: 'Manifold learning finance', duration: '5:05' },
  { id: 426, title: 'Spectral clustering finance', duration: '3:18' },
  { id: 427, title: 'Laplacian eigenmaps', duration: '4:31' },
  { id: 428, title: 'Locally linear embedding', duration: '5:44' },
  { id: 429, title: 'Isomap embedding', duration: '3:57' },
  { id: 430, title: 't-SNE dimensionality reduction', duration: '4:10' },
  { id: 431, title: 'UMAP dimensionality reduction', duration: '5:23' },
  { id: 432, title: 'PHATE embedding', duration: '3:36' },
  { id: 433, title: 'Diffusion maps finance', duration: '4:49' },
  { id: 434, title: 'Markov diffusion maps', duration: '5:02' },
  { id: 435, title: 'Laplacian-based clustering', duration: '3:15' },
  { id: 436, title: 'Spectral graph partitioning', duration: '4:28' },
  { id: 437, title: 'Community detection finance', duration: '5:41' },
  { id: 438, title: 'Modularity optimization', duration: '3:54' },
  { id: 439, title: 'Stochastic block models', duration: '4:07' },
  { id: 440, title: 'Degree-corrected block model', duration: '5:20' },
  { id: 441, title: 'Hierarchical block model', duration: '3:33' },
  { id: 442, title: 'Nested block model', duration: '4:46' },
  { id: 443, title: 'Multilayer networks finance', duration: '5:59' },
  { id: 444, title: 'Temporal networks', duration: '3:12' },
  { id: 445, title: 'Dynamic community detection', duration: '4:25' },
  { id: 446, title: 'Network embedding methods', duration: '5:38' },
  { id: 447, title: 'Node2vec embedding', duration: '3:51' },
  { id: 448, title: 'DeepWalk embedding', duration: '4:04' },
  { id: 449, title: 'GraphSAGE architecture', duration: '5:17' },
  { id: 450, title: 'Graph attention networks', duration: '3:30' },
  { id: 451, title: 'Graph isomorphism networks', duration: '4:43' },
  { id: 452, title: 'Equivariant graph networks', duration: '5:56' },
  { id: 453, title: 'Message passing neural nets', duration: '3:09' },
  { id: 454, title: 'Relational graph convnets', duration: '4:22' },
  { id: 455, title: 'Spatial-temporal graphs', duration: '5:35' },
  { id: 456, title: 'Dynamic graph networks', duration: '3:48' },
  { id: 457, title: 'Evolving graph learning', duration: '4:01' },
  { id: 458, title: 'Causal discovery finance', duration: '5:14' },
  { id: 459, title: 'Structural causal models', duration: '3:27' },
  { id: 460, title: 'do-calculus and interventions', duration: '4:40' },
  { id: 461, title: 'Counterfactual reasoning', duration: '5:53' },
  { id: 462, title: 'Causal effect estimation', duration: '3:06' },
  { id: 463, title: 'Doubly robust estimation', duration: '4:19' },
  { id: 464, title: 'Propensity score methods', duration: '5:32' },
  { id: 465, title: 'Matching estimators', duration: '3:45' },
  { id: 466, title: 'Inverse probability weighting', duration: '4:58' },
  { id: 467, title: 'Instrumental causal inference', duration: '5:11' },
  { id: 468, title: 'Mediation analysis', duration: '3:24' },
  { id: 469, title: 'Moderation analysis', duration: '4:37' },
  { id: 470, title: 'Sensitivity analysis causal', duration: '5:50' },
  { id: 471, title: 'Partial identification', duration: '3:03' },
  { id: 472, title: 'Bounds on causal effects', duration: '4:16' },
  { id: 473, title: 'Nonparametric causal inference', duration: '5:29' },
  { id: 474, title: 'Causal forests', duration: '3:42' },
  { id: 475, title: 'Causal boosting', duration: '4:55' },
  { id: 476, title: 'Orthogonal machine learning', duration: '5:08' },
  { id: 477, title: 'Double machine learning', duration: '3:21' },
  { id: 478, title: 'Targeted maximum likelihood', duration: '4:34' },
  { id: 479, title: 'Causal representation learning', duration: '5:47' },
  { id: 480, title: 'Disentangled representations', duration: '3:00' },
  { id: 481, title: 'Invariant risk minimization', duration: '4:13' },
  { id: 482, title: 'Out-of-distribution generalization', duration: '5:26' },
  { id: 483, title: 'Domain adaptation finance', duration: '3:39' },
  { id: 484, title: 'Transfer learning markets', duration: '4:52' },
  { id: 485, title: 'Federated learning finance', duration: '5:05' },
  { id: 486, title: 'Privacy-preserving ML', duration: '3:18' },
  { id: 487, title: 'Differential privacy markets', duration: '4:31' },
  { id: 488, title: 'Homomorphic encryption finance', duration: '5:44' },
  { id: 489, title: 'Secure multi-party computation', duration: '3:57' },
  { id: 490, title: 'Trusted execution environments', duration: '4:10' },
  { id: 491, title: 'Zero-knowledge proofs finance', duration: '5:23' },
  { id: 492, title: 'Blockchain oracles', duration: '3:36' },
  { id: 493, title: 'Decentralized identity', duration: '4:49' },
  { id: 494, title: 'Token engineering deep', duration: '5:02' },
  { id: 495, title: 'Mechanism design theory', duration: '3:15' },
  { id: 496, title: 'Auction theory advanced', duration: '4:28' },
  { id: 497, title: 'Matching markets design', duration: '5:41' },
  { id: 498, title: 'Market design fundamentals', duration: '3:54' },
  { id: 499, title: 'Spectrum auction design', duration: '4:07' },
  { id: 500, title: 'Sponsored search auctions', duration: '5:20' },
];

export default function Videos() {
  const navigate = useNavigate();
  const [level, setLevel] = useState<LevelData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchingVideo, setWatchingVideo] = useState<number | null>(null);
  const [completedToday, setCompletedToday] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data: progressData, error: progressErr } = await supabase
          .from('user_progress')
          .select('nivel_activo, videos_vistos_hoy, videos_fecha, saldo_ingresos, ganancias_hoy, ganancias_mes, ganancias_semana, ingresos_totales, pasantia_completada')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!progressErr && progressData) {
          setProgress(progressData as ProgressData);
        }

        const activeLevel = (progressData as { nivel_activo: string } | null)?.nivel_activo || 'pasantia';
        const { data: levelData, error: levelErr } = await supabase
          .from('levels')
          .select('id, task_payment, daily_tasks')
          .eq('id', activeLevel)
          .maybeSingle();

        if (!levelErr && levelData) {
          setLevel(levelData as LevelData);
        }
      } catch {
        // Connection error — non-fatal
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const isSameDay = progress?.videos_fecha === today;
  const videosVistosHoy = isSameDay ? (progress?.videos_vistos_hoy ?? 0) : 0;
  const tareasRestantes = level ? Math.max(0, level.daily_tasks - videosVistosHoy) : 0;
  const allTasksDone = tareasRestantes === 0;

  const isPasantia = (progress?.nivel_activo || 'pasantia') === 'pasantia';
  const isPasantiaBlocked = isPasantia && (progress?.pasantia_completada ?? false);
  const canWatchVideos = !isPasantiaBlocked && !allTasksDone;

  async function handleWatchVideo(videoId: number) {
    if (allTasksDone || watchingVideo !== null || !canWatchVideos) return;

    setWatchingVideo(videoId);
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setWatchingVideo(null); return; }

      const { data: freshProg } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const prog = freshProg as Record<string, unknown> | null;
      const progFecha = String(prog?.videos_fecha ?? '');
      const isCurrentDay = progFecha === today;
      const currentWatched = isCurrentDay ? Number(prog?.videos_vistos_hoy ?? 0) : 0;

      if (currentWatched >= (level?.daily_tasks ?? 0)) {
        setWatchingVideo(null);
        return;
      }

      const newWatched = currentWatched + 1;
      const taskPayment = level?.task_payment ?? 1000;

      const updatePayload: Record<string, unknown> = {
        videos_vistos_hoy: newWatched,
        videos_fecha: today,
        saldo_ingresos: (Number(prog?.saldo_ingresos) || 0) + taskPayment,
        ganancias_hoy: isCurrentDay ? (Number(prog?.ganancias_hoy) || 0) + taskPayment : taskPayment,
        ganancias_mes: (Number(prog?.ganancias_mes) || 0) + taskPayment,
        ganancias_semana: (Number(prog?.ganancias_semana) || 0) + taskPayment,
        ingresos_totales: (Number(prog?.ingresos_totales) || 0) + taskPayment,
        updated_at: new Date().toISOString(),
      };

      if (!isCurrentDay) {
        updatePayload.ganancias_hoy = taskPayment;
      }

      const isPasantiaLevelNow = String(prog?.nivel_activo || 'pasantia') === 'pasantia';
      const justFinishedAllTasks = newWatched >= (level?.daily_tasks ?? 5);

      if (isPasantiaLevelNow && justFinishedAllTasks) {
        updatePayload.pasantia_completada = true;
      }

      await supabase
        .from('user_progress')
        .update(updatePayload)
        .eq('user_id', user.id);

      setCompletedToday(prev => new Set([...prev, videoId]));
        setProgress(prev => prev ? {
          ...prev,
          videos_vistos_hoy: newWatched,
          videos_fecha: today,
          saldo_ingresos: (Number(prev.saldo_ingresos) || 0) + taskPayment,
          ganancias_hoy: isCurrentDay ? (Number(prev.ganancias_hoy) || 0) + taskPayment : taskPayment,
          ganancias_mes: (Number(prev.ganancias_mes) || 0) + taskPayment,
          ganancias_semana: (Number(prev.ganancias_semana) || 0) + taskPayment,
          ingresos_totales: (Number(prev.ingresos_totales) || 0) + taskPayment,
          pasantia_completada: isPasantiaLevelNow && justFinishedAllTasks ? true : prev.pasantia_completada,
        } : prev);
    } catch {
      // Silent fail on video watch DB update
    } finally {
      setWatchingVideo(null);
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-x-hidden pb-20 flex items-center justify-center" style={{ background: '#000000' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#FFC107', animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#FFC107', animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#FFC107', animationDelay: '300ms' }} />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (isPasantiaBlocked) {
    return (
      <div className="relative min-h-screen overflow-x-hidden pb-20" style={{ background: '#000000' }}>
        <div className="fixed pointer-events-none z-0" style={{ width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.06) 0%, transparent 70%)', top: '-200px', left: '50%', transform: 'translateX(-50%)' }} />
        <div className="fixed pointer-events-none z-0" style={{ width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.04) 0%, transparent 70%)', bottom: '100px', left: '50%', transform: 'translateX(-50%)' }} />
        <div className="relative z-10 flex flex-col min-h-screen px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate('/perfil')} className="flex items-center gap-2 transition-opacity hover:opacity-70 active:scale-95" style={{ color: '#FFC107' }}>
              <ArrowLeft size={20} /><span className="text-sm font-bold">Regresar al Perfil</span>
            </button>
            <div className="flex items-center gap-2">
              <Video size={14} style={{ color: '#FFC107' }} />
              <span className="text-xs font-extrabold tracking-[0.2em] uppercase" style={{ color: '#FFC107' }}>Vídeos</span>
              <Video size={14} style={{ color: '#FFC107' }} />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-sm rounded-3xl p-8 text-center" style={{ background: '#1A1A1A', border: '1px solid rgba(255,193,7,0.3)', boxShadow: '0 0 40px rgba(255,193,7,0.12)' }}>
              <div className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,193,7,0.12)' }}>
                <Lock size={24} style={{ color: '#FFC107' }} />
              </div>
              <h2 className="font-black text-xl mb-3" style={{ background: 'linear-gradient(135deg, #FFD700, #B8860B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pasantía Completada</h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: '#888888' }}>Has completado todas las tareas de la Pasantía. Para seguir calificando videos y obtener mayores ganancias, compra un nivel superior.</p>
              <button onClick={() => navigate('/niveles')} className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-95" style={{ background: '#FFC107', color: '#000000', boxShadow: '0 4px 20px rgba(255,193,7,0.3)' }}>
                <Zap size={16} /> Comprar Nivel Superior
              </button>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-20" style={{ background: '#000000' }}>
      <div className="fixed pointer-events-none z-0" style={{ width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.06) 0%, transparent 70%)', top: '-200px', left: '50%', transform: 'translateX(-50%)' }} />
      <div className="fixed pointer-events-none z-0" style={{ width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.04) 0%, transparent 70%)', bottom: '100px', left: '50%', transform: 'translateX(-50%)' }} />

      <div className="relative z-10 flex flex-col min-h-screen px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/perfil')} className="flex items-center gap-2 transition-opacity hover:opacity-70 active:scale-95" style={{ color: '#FFC107' }}>
            <ArrowLeft size={20} /><span className="text-sm font-bold">Regresar al Perfil</span>
          </button>
          <div className="flex items-center gap-2">
            <Video size={14} style={{ color: '#FFC107' }} />
            <span className="text-xs font-extrabold tracking-[0.2em] uppercase" style={{ color: '#FFC107' }}>Vídeos</span>
            <Video size={14} style={{ color: '#FFC107' }} />
          </div>
        </div>

        <div className="w-full max-w-lg mx-auto mb-5">
          <div className="rounded-2xl p-4" style={{ background: '#1A1A1A', border: allTasksDone ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,193,7,0.2)', boxShadow: allTasksDone ? '0 0 20px rgba(34,197,94,0.1)' : '0 0 12px rgba(255,193,7,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign size={16} style={{ color: allTasksDone ? '#22C55E' : '#FFC107' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#888888' }}>Tareas de hoy ({level?.id?.toUpperCase() ?? 'Pasantía'})</span>
              </div>
              <span className="text-sm font-black" style={{ color: allTasksDone ? '#22C55E' : '#FFC107' }}>{videosVistosHoy} / {level?.daily_tasks ?? 5}</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,193,7,0.1)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(videosVistosHoy / (level?.daily_tasks ?? 5)) * 100}%`, background: allTasksDone ? 'linear-gradient(90deg, #22C55E, #4ADE80)' : 'linear-gradient(90deg, #FFC107, #FFD700)' }} />
            </div>
            {allTasksDone && (
              <div className="flex items-center gap-1.5 mt-2">
                <CheckCircle2 size={14} style={{ color: '#22C55E' }} />
                <span className="text-xs font-bold" style={{ color: '#22C55E' }}>Has completado todas las tareas diarias. Vuelve mañana.</span>
              </div>
            )}
            {!allTasksDone && (
              <p className="text-xs mt-2" style={{ color: '#888888' }}>Gana <span style={{ color: '#FFC107', fontWeight: 900 }}>${level?.task_payment.toLocaleString('es-CO') ?? '1,000'}</span> por cada vídeo visto</p>
            )}
          </div>
        </div>

        <div className="w-full max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Sparkles size={12} style={{ color: '#FFC107' }} />
            <span className="text-xs font-extrabold tracking-[0.2em] uppercase" style={{ color: '#FFC107' }}>Videos Disponibles</span>
          </div>
          <div className="flex flex-col gap-3">
            {MOCK_VIDEOS.slice(0, level?.daily_tasks ?? 5).map((video) => {
              const isCompleted = completedToday.has(video.id);
              const isCurrentlyWatching = watchingVideo === video.id;
              const canWatch = !allTasksDone && !isCompleted && watchingVideo === null;
              return (
                <VideoRow key={video.id} video={video} isCompleted={isCompleted} isWatching={isCurrentlyWatching} canWatch={canWatch} disabled={allTasksDone} taskPayment={level?.task_payment ?? 1000} onWatch={() => handleWatchVideo(video.id)} />
              );
            })}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function VideoRow({ video, isCompleted, isWatching, canWatch, disabled, taskPayment, onWatch }: {
  video: { id: number; title: string; duration: string }; isCompleted: boolean; isWatching: boolean; canWatch: boolean; disabled: boolean; taskPayment: number; onWatch: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button onClick={canWatch ? onWatch : undefined} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center gap-3 rounded-xl transition-all duration-300"
      style={{ background: isCompleted ? 'rgba(34,197,94,0.06)' : hovered && canWatch ? 'rgba(255,193,7,0.06)' : '#1A1A1A', border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.3)' : hovered && canWatch ? 'rgba(255,193,7,0.35)' : 'rgba(255,193,7,0.12)'}`, boxShadow: isCompleted ? '0 0 12px rgba(34,197,94,0.06)' : hovered && canWatch ? '0 0 16px rgba(255,193,7,0.08)' : 'none', padding: '14px 16px', opacity: disabled && !isCompleted ? 0.4 : 1, cursor: canWatch ? 'pointer' : 'default' }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: isCompleted ? 'rgba(34,197,94,0.12)' : 'rgba(255,193,7,0.08)' }}>
        {isCompleted ? <CheckCircle2 size={18} style={{ color: '#22C55E' }} /> : isWatching ? <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#FFC107', borderTopColor: 'transparent' }} /> : <Play size={16} style={{ color: canWatch ? '#FFC107' : '#555555' }} />}
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-bold" style={{ color: isCompleted ? 'rgba(34,197,94,0.7)' : '#FFFFFF' }}>{video.title}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <Clock size={10} style={{ color: '#888888' }} />
          <span className="text-xs" style={{ color: '#888888' }}>{video.duration}</span>
        </div>
      </div>
      {isCompleted && <span className="text-xs font-bold" style={{ color: '#22C55E' }}>+${taskPayment.toLocaleString('es-CO')}</span>}
      {isWatching && <span className="text-xs font-bold" style={{ color: '#FFC107' }}>Viendo...</span>}
    </button>
  );
}
