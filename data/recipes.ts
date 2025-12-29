
import { Recipe } from "../types";

export const MOCK_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Overnight Oats de Frutos Vermelhos',
    category: 'Pequeno-almoço',
    time: '5 min (+noite)',
    calories: 320,
    macros: { p: 12, c: 45, f: 8 },
    ingredients: ['Aveia', 'Leite ou Bebida Vegetal', 'Frutos Vermelhos', 'Sementes de Chia'],
    steps: ['Misturar aveia e leite num frasco.', 'Adicionar chia e mexer.', 'Deixar no frigorífico durante a noite.', 'Adicionar frutas antes de servir.'],
    isPremium: false
  },
  {
    id: '2',
    title: 'Salada de Frango e Quinoa',
    category: 'Almoço',
    time: '20 min',
    calories: 450,
    macros: { p: 35, c: 40, f: 15 },
    ingredients: ['Peito de frango', 'Quinoa cozida', 'Espinafres', 'Tomate cherry', 'Azeite'],
    steps: ['Grelhar o frango temperado.', 'Misturar quinoa e vegetais.', 'Fatiar o frango e colocar por cima.', 'Temperar com azeite e limão.'],
    isPremium: false
  },
  {
    id: '3',
    title: 'Wrap de Atum Express',
    category: 'Rápida',
    time: '5 min',
    calories: 380,
    macros: { p: 30, c: 35, f: 10 },
    ingredients: ['Tortilha integral', 'Lata de atum ao natural', 'Alface', 'Milho', 'Iogurte grego'],
    steps: ['Escorrer o atum.', 'Misturar com iogurte e milho.', 'Espalhar na tortilha com alface.', 'Enrolar e servir.'],
    isPremium: false
  },
  {
    id: '4',
    title: 'Salmão Grelhado com Espargos',
    category: 'Jantar',
    time: '15 min',
    calories: 420,
    macros: { p: 32, c: 5, f: 28 },
    ingredients: ['Lombo de salmão', 'Espargos', 'Limão', 'Alho'],
    steps: ['Temperar salmão com limão e alho.', 'Grelhar 4 min de cada lado.', 'Saltear espargos na mesma frigideira.'],
    isPremium: true
  },
  {
    id: '5',
    title: 'Panquecas de Proteína de Banana',
    category: 'Pequeno-almoço',
    time: '15 min',
    calories: 350,
    macros: { p: 25, c: 40, f: 10 },
    ingredients: ['Banana', 'Ovos', 'Proteína em pó (opcional)', 'Aveia'],
    steps: ['Esmagar banana.', 'Misturar ovos e aveia.', 'Cozinhar em frigideira antiaderente.'],
    isPremium: true
  },
  {
    id: '6',
    title: 'Omelete de Claras e Vegetais',
    category: 'Económica',
    time: '10 min',
    calories: 200,
    macros: { p: 20, c: 5, f: 8 },
    ingredients: ['Claras de ovo', 'Espinafres', 'Cogumelos', 'Tomate'],
    steps: ['Saltear vegetais.', 'Adicionar claras batidas.', 'Cozinhar até firmar.'],
    isPremium: false
  },
  {
    id: '18',
    title: 'Maçã com Canela e Manteiga de Amendoim',
    category: 'Snack',
    time: '3 min',
    calories: 210,
    macros: { p: 5, c: 22, f: 12 },
    ingredients: ['1 Maçã', '1 c.sopa Manteiga de Amendoim', 'Canela em pó'],
    steps: ['Corte a maçã em fatias.', 'Disponha num prato.', 'Coloque a manteiga de amendoim por cima ou ao lado.', 'Polvilhe com canela.'],
    isPremium: false
  },
  {
    id: '19',
    title: 'Cuscuz de Atum e Milho',
    category: 'Rápida',
    time: '7 min',
    calories: 390,
    macros: { p: 26, c: 45, f: 10 },
    ingredients: ['1/2 chávena Cuscuz', '1 lata Atum ao natural', 'Milho', 'Azeite'],
    steps: ['Coloque o cuscuz numa taça com água a ferver.', 'Tape e deixe hidratar 5 min.', 'Solte com um garfo.', 'Misture o atum e o milho.', 'Tempere com azeite.'],
    isPremium: false
  }
];
