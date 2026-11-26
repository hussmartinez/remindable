import { describe, expect, it } from '@jest/globals';

import { CONCEPTS } from '@/content/concepts';
import { LANGS } from '@/lib/lang';
import { matchSpoken, targetsFor } from '../wordMatch';
import { contentStems, normalize, stem } from '../textNorm';

const yes = (heard: string, target: string, lang: 'es' | 'en' | 'ar', others: string[] = []) =>
  matchSpoken([heard], [target], lang, others).match;

describe('textNorm', () => {
  it('folds case, accents and punctuation', () => {
    expect(normalize('¡El Árbol, señor!')).toBe('el arbol senor');
    expect(normalize("Don't")).toBe('dont');
  });
  it('strips Arabic tashkeel, tatweel and letter variants', () => {
    expect(normalize('تُفَّاحَةٌ')).toBe('تفاحه');
    expect(normalize('أرنـــب')).toBe('ارنب');
    expect(normalize('إلى')).toBe('الي');
  });
  it('stems plurals', () => {
    expect(stem('manzanas', 'es')).toBe(stem('manzana', 'es'));
    expect(stem('peces', 'es')).toBe('pez');
    expect(stem('cherries', 'en')).toBe('cherry');
    expect(stem('dogs', 'en')).toBe('dog');
    expect(stem(normalize('التفاحات'), 'ar')).toBe(stem(normalize('تفاحة'), 'ar'));
  });
  it('drops stop words', () => {
    expect(contentStems('it is used for the soup', 'en')).toEqual(['soup']);
    expect(contentStems('es una cosa para la sopa', 'es')).toEqual(['sopa']);
    expect(contentStems('هو شيء في المطبخ', 'ar')).toEqual(['مطبخ']);
  });
});

describe('wordMatch', () => {
  it('accepts the word alone, in a sentence, with an article, or as a plural (es)', () => {
    expect(yes('manzana', 'manzana', 'es')).toBe(true);
    expect(yes('Es una manzana', 'manzana', 'es')).toBe(true);
    expect(yes('manzanas', 'manzana', 'es')).toBe(true);
    expect(yes('el árbol', 'árbol', 'es')).toBe(true);
    expect(yes('arbol', 'árbol', 'es')).toBe(true);
    expect(yes('creo que son peces', 'pez', 'es')).toBe(true);
    expect(yes('mariposa', 'mariposa', 'es')).toBe(true);
    expect(yes('maripoza', 'mariposa', 'es')).toBe(true);
  });

  it('accepts the word in English with articles and plurals', () => {
    expect(yes("I think it's an apple", 'apple', 'en')).toBe(true);
    expect(yes('The dogs', 'dog', 'en')).toBe(true);
    expect(yes('Butterfly.', 'butterfly', 'en')).toBe(true);
    expect(yes('a thermometer', 'thermometer', 'en')).toBe(true);
    expect(yes('air plane', 'airplane', 'en')).toBe(true);
  });

  it('accepts Arabic with al-, tashkeel, and feminine or plural endings', () => {
    expect(yes('تفاحة', 'تفاحة', 'ar')).toBe(true);
    expect(yes('التفاحة', 'تفاحة', 'ar')).toBe(true);
    expect(yes('تُفَّاحَة', 'تفاحة', 'ar')).toBe(true);
    expect(yes('تفاحات', 'تفاحة', 'ar')).toBe(true);
    expect(yes('هذه قطه', 'قطة', 'ar')).toBe(true);
    expect(yes('ميزان الحرارة', 'ميزان حرارة', 'ar')).toBe(true);
    expect(yes('الكلب', 'كلب', 'ar')).toBe(true);
  });

  it('rejects different words', () => {
    expect(yes('banana', 'apple', 'en')).toBe(false);
    expect(yes('car', 'cat', 'en')).toBe(false);
    expect(yes('sal', 'sol', 'es')).toBe(false);
    expect(yes('perro', 'gato', 'es')).toBe(false);
    expect(yes('كلب', 'قطة', 'ar')).toBe(false);
    expect(yes('', 'apple', 'en')).toBe(false);
  });

  it('rejects when what was heard is closer to another option on screen', () => {
    expect(yes('violín', 'vela', 'es', ['violín', 'trompeta'])).toBe(false);
    expect(matchSpoken(['the cat'], ['cat'], 'en', ['car', 'cow']).match).toBe(true);
  });

  it('uses any recogniser alternative and everyday synonyms', () => {
    expect(matchSpoken(['a pal', 'apple'], ['apple'], 'en').match).toBe(true);
    expect(matchSpoken(['un carro'], targetsFor('car', 'coche', 'es'), 'es').match).toBe(true);
    expect(matchSpoken(['bike'], targetsFor('bicycle', 'bicycle', 'en'), 'en').match).toBe(true);
  });

  it('every concept word matches itself in every language', () => {
    for (const c of CONCEPTS) {
      for (const l of LANGS) expect(yes(c.word[l], c.word[l], l)).toBe(true);
    }
  });
});
