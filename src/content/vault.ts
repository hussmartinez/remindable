import type { Localized } from '@/lib/lang';

/**
 * Memory Vault content: everyday associations learned by spaced retrieval.
 * - People: face + job → name (name–face learning).
 * - Places: object → where it was put (the "where did I leave my keys?" problem).
 */

export type Person = { id: string; emoji: string; gender: 'f' | 'm'; name: Localized; job: Localized };

export const PEOPLE: Person[] = [
  { id: 'lina', emoji: '👩‍🍳', gender: 'f', name: { es: 'Lina', en: 'Lina', ar: 'لينا' }, job: { es: 'cocinera', en: 'a cook', ar: 'طبّاخة' } },
  { id: 'omar', emoji: '👨‍🔧', gender: 'm', name: { es: 'Omar', en: 'Omar', ar: 'عمر' }, job: { es: 'mecánico', en: 'a mechanic', ar: 'ميكانيكي' } },
  { id: 'sara', emoji: '👩‍⚕️', gender: 'f', name: { es: 'Sara', en: 'Sara', ar: 'سارة' }, job: { es: 'doctora', en: 'a doctor', ar: 'طبيبة' } },
  { id: 'daniel', emoji: '👨‍🏫', gender: 'm', name: { es: 'Daniel', en: 'Daniel', ar: 'دانيال' }, job: { es: 'profesor', en: 'a teacher', ar: 'معلّم' } },
  { id: 'rosa', emoji: '👩‍🌾', gender: 'f', name: { es: 'Rosa', en: 'Rosa', ar: 'روزا' }, job: { es: 'agricultora', en: 'a farmer', ar: 'مزارعة' } },
  { id: 'karim', emoji: '👨‍🎨', gender: 'm', name: { es: 'Karim', en: 'Karim', ar: 'كريم' }, job: { es: 'pintor', en: 'a painter', ar: 'رسّام' } },
  { id: 'maya', emoji: '👩‍✈️', gender: 'f', name: { es: 'Maya', en: 'Maya', ar: 'مايا' }, job: { es: 'piloto', en: 'a pilot', ar: 'طيّارة' } },
  { id: 'hugo', emoji: '👨‍🚒', gender: 'm', name: { es: 'Hugo', en: 'Hugo', ar: 'هوغو' }, job: { es: 'bombero', en: 'a firefighter', ar: 'رجل إطفاء' } },
  { id: 'leila', emoji: '👩‍🔬', gender: 'f', name: { es: 'Leila', en: 'Leila', ar: 'ليلى' }, job: { es: 'científica', en: 'a scientist', ar: 'عالِمة' } },
  { id: 'pablo', emoji: '👨‍🌾', gender: 'm', name: { es: 'Pablo', en: 'Pablo', ar: 'بابلو' }, job: { es: 'jardinero', en: 'a gardener', ar: 'بستاني' } },
  { id: 'nora', emoji: '👩‍🎤', gender: 'f', name: { es: 'Nora', en: 'Nora', ar: 'نورا' }, job: { es: 'cantante', en: 'a singer', ar: 'مغنّية' } },
  { id: 'samir', emoji: '👨‍💼', gender: 'm', name: { es: 'Samir', en: 'Samir', ar: 'سمير' }, job: { es: 'banquero', en: 'a banker', ar: 'مصرفي' } },
];

export type Thing = { id: string; emoji: string; name: Localized };

export const THINGS: Thing[] = [
  { id: 'keys', emoji: '🔑', name: { es: 'las llaves', en: 'the keys', ar: 'المفاتيح' } },
  { id: 'glasses', emoji: '👓', name: { es: 'las gafas', en: 'the glasses', ar: 'النظارة' } },
  { id: 'phone', emoji: '📱', name: { es: 'el móvil', en: 'the phone', ar: 'الهاتف' } },
  { id: 'wallet', emoji: '👛', name: { es: 'el monedero', en: 'the purse', ar: 'المحفظة' } },
  { id: 'watch', emoji: '⌚', name: { es: 'el reloj', en: 'the watch', ar: 'ساعة اليد' } },
  { id: 'pills', emoji: '💊', name: { es: 'las pastillas', en: 'the pills', ar: 'الحبوب' } },
  { id: 'letter', emoji: '✉️', name: { es: 'la carta', en: 'the letter', ar: 'الرسالة' } },
  { id: 'umbrella', emoji: '☂️', name: { es: 'el paraguas', en: 'the umbrella', ar: 'المظلة' } },
];

export type Spot = { id: string; name: Localized };

export const SPOTS: Spot[] = [
  { id: 'drawer', name: { es: 'en el cajón', en: 'in the drawer', ar: 'في الدُّرج' } },
  { id: 'door', name: { es: 'junto a la puerta', en: 'by the door', ar: 'بجانب الباب' } },
  { id: 'shelf', name: { es: 'en la estantería', en: 'on the shelf', ar: 'على الرف' } },
  { id: 'coat', name: { es: 'en el bolsillo del abrigo', en: 'in the coat pocket', ar: 'في جيب المعطف' } },
  { id: 'nightstand', name: { es: 'en la mesita de noche', en: 'on the nightstand', ar: 'على الطاولة بجانب السرير' } },
  { id: 'bluebox', name: { es: 'en la caja azul', en: 'in the blue box', ar: 'في الصندوق الأزرق' } },
  { id: 'cushion', name: { es: 'debajo del cojín', en: 'under the cushion', ar: 'تحت الوسادة' } },
  { id: 'basket', name: { es: 'en la cesta de la cocina', en: 'in the kitchen basket', ar: 'في سلة المطبخ' } },
];

/** What the user learned. Places are assigned randomly so every user gets different pairs. */
export type VaultItem =
  | { id: string; kind: 'person'; personId: string }
  | { id: string; kind: 'place'; thingId: string; spotId: string };
