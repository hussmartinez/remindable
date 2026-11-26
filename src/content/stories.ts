import type { Localized } from '@/lib/lang';

/**
 * Story Thread dialogues: short everyday conversations for practising
 * following a conversation (who said what, order of events, topic).
 */

export type Speaker = { emoji: string; name: Localized };

export type Story = {
  id: string;
  speakers: [Speaker, Speaker];
  lines: { s: 0 | 1; text: Localized }[];
  topic: Localized;
  wrongTopics: [Localized, Localized];
  /** Events in the order they happen in the conversation. */
  events: Localized[];
};

const SARA: Speaker = { emoji: '👩', name: { es: 'Sara', en: 'Sara', ar: 'سارة' } };
const OMAR: Speaker = { emoji: '👨', name: { es: 'Omar', en: 'Omar', ar: 'عمر' } };
const ROSA: Speaker = { emoji: '👵', name: { es: 'la abuela Rosa', en: 'Grandma Rosa', ar: 'الجدة روزا' } };
const ADAM: Speaker = { emoji: '👦', name: { es: 'Adam', en: 'Adam', ar: 'آدم' } };
const NORA: Speaker = { emoji: '👩‍🦳', name: { es: 'Nora', en: 'Nora', ar: 'نورا' } };
const KARIM: Speaker = { emoji: '👨‍💼', name: { es: 'Karim', en: 'Karim', ar: 'كريم' } };
const HUGO: Speaker = { emoji: '👴', name: { es: 'Hugo', en: 'Hugo', ar: 'هوغو' } };
const LINA: Speaker = { emoji: '👩‍🦰', name: { es: 'Lina', en: 'Lina', ar: 'لينا' } };

export const STORIES: Story[] = [
  {
    id: 'market',
    speakers: [SARA, OMAR],
    lines: [
      { s: 0, text: { es: 'Omar, voy al mercado. ¿Necesitas algo?', en: "Omar, I'm going to the market. Do you need anything?", ar: 'يا عمر، أنا ذاهبة إلى السوق. هل تحتاج شيئاً؟' } },
      { s: 1, text: { es: 'Sí, por favor. Tráeme pan y seis huevos.', en: 'Yes, please. Bring me bread and six eggs.', ar: 'نعم، من فضلك. أحضري لي خبزاً وست بيضات.' } },
      { s: 0, text: { es: 'Vale. También compraré naranjas para el zumo.', en: "Okay. I'll also buy oranges for juice.", ar: 'حسناً. سأشتري أيضاً برتقالاً للعصير.' } },
      { s: 1, text: { es: 'Perfecto. Yo preparo el desayuno para los dos.', en: "Perfect. I'll make breakfast for both of us.", ar: 'ممتاز. سأحضّر الفطور لكلينا.' } },
    ],
    topic: { es: 'Las compras para el desayuno', en: 'Shopping for breakfast', ar: 'التسوّق من أجل الفطور' },
    wrongTopics: [
      { es: 'Un viaje a la playa', en: 'A trip to the beach', ar: 'رحلة إلى الشاطئ' },
      { es: 'Una cita con el médico', en: "A doctor's appointment", ar: 'موعد عند الطبيب' },
    ],
    events: [
      { es: 'Sara dice que va al mercado', en: 'Sara says she is going to the market', ar: 'سارة تقول إنها ذاهبة إلى السوق' },
      { es: 'Omar pide pan y huevos', en: 'Omar asks for bread and eggs', ar: 'عمر يطلب خبزاً وبيضاً' },
      { es: 'Sara decide comprar naranjas', en: 'Sara decides to buy oranges', ar: 'سارة تقرر شراء البرتقال' },
      { es: 'Omar ofrece preparar el desayuno', en: 'Omar offers to make breakfast', ar: 'عمر يعرض تحضير الفطور' },
    ],
  },
  {
    id: 'grandma',
    speakers: [ROSA, ADAM],
    lines: [
      { s: 1, text: { es: '¡Hola, abuela! ¿Puedo visitarte el domingo?', en: 'Hi Grandma! Can I visit you on Sunday?', ar: 'مرحباً يا جدتي! هل أستطيع زيارتك يوم الأحد؟' } },
      { s: 0, text: { es: '¡Claro, cariño! Haré tu tarta de chocolate.', en: "Of course, dear! I'll bake your chocolate cake.", ar: 'طبعاً يا حبيبي! سأخبز لك كعكة الشوكولاتة.' } },
      { s: 1, text: { es: 'Genial. Llevaré las fotos del viaje.', en: "Great. I'll bring the photos from my trip.", ar: 'رائع. سأحضر صور رحلتي.' } },
      { s: 0, text: { es: 'Ven a las cinco, después de mi siesta.', en: 'Come at five, after my nap.', ar: 'تعال في الساعة الخامسة، بعد قيلولتي.' } },
    ],
    topic: { es: 'Una visita a la abuela', en: 'A visit to Grandma', ar: 'زيارة إلى الجدة' },
    wrongTopics: [
      { es: 'Arreglar el coche', en: 'Fixing the car', ar: 'تصليح السيارة' },
      { es: 'Un partido de fútbol', en: 'A football match', ar: 'مباراة كرة قدم' },
    ],
    events: [
      { es: 'Adam pregunta si puede visitarla', en: 'Adam asks if he can visit', ar: 'آدم يسأل إن كان يستطيع الزيارة' },
      { es: 'La abuela promete una tarta', en: 'Grandma promises a cake', ar: 'الجدة تعد بكعكة' },
      { es: 'Adam dice que llevará fotos', en: 'Adam says he will bring photos', ar: 'آدم يقول إنه سيحضر الصور' },
      { es: 'La abuela dice la hora', en: 'Grandma says what time to come', ar: 'الجدة تحدد الساعة' },
    ],
  },
  {
    id: 'clinic',
    speakers: [NORA, KARIM],
    lines: [
      { s: 1, text: { es: 'Buenos días, Nora. Llamo de la clínica.', en: "Good morning, Nora. I'm calling from the clinic.", ar: 'صباح الخير يا نورا. أتصل من العيادة.' } },
      { s: 1, text: { es: 'Su cita del martes pasa al jueves a las diez.', en: 'Your Tuesday appointment is moved to Thursday at ten.', ar: 'موعدك يوم الثلاثاء أصبح يوم الخميس في الساعة العاشرة.' } },
      { s: 0, text: { es: 'De acuerdo. ¿Tengo que llevar algo?', en: 'All right. Do I need to bring anything?', ar: 'حسناً. هل يجب أن أحضر شيئاً؟' } },
      { s: 1, text: { es: 'Sí, su tarjeta sanitaria y la lista de medicinas.', en: 'Yes, your health card and your list of medicines.', ar: 'نعم، بطاقتك الصحية وقائمة أدويتك.' } },
    ],
    topic: { es: 'Un cambio de cita médica', en: "A change to a doctor's appointment", ar: 'تغيير موعد عند الطبيب' },
    wrongTopics: [
      { es: 'Una fiesta de cumpleaños', en: 'A birthday party', ar: 'حفلة عيد ميلاد' },
      { es: 'Comprar un regalo', en: 'Buying a present', ar: 'شراء هدية' },
    ],
    events: [
      { es: 'Karim dice que llama de la clínica', en: 'Karim says he is calling from the clinic', ar: 'كريم يقول إنه يتصل من العيادة' },
      { es: 'Karim cambia la cita al jueves', en: 'Karim moves the appointment to Thursday', ar: 'كريم ينقل الموعد إلى الخميس' },
      { es: 'Nora pregunta qué debe llevar', en: 'Nora asks what to bring', ar: 'نورا تسأل ماذا تحضر' },
      { es: 'Karim pide la tarjeta sanitaria', en: 'Karim asks for the health card', ar: 'كريم يطلب البطاقة الصحية' },
    ],
  },
  {
    id: 'glasses',
    speakers: [HUGO, LINA],
    lines: [
      { s: 0, text: { es: 'Lina, no encuentro mis gafas por ningún sitio.', en: "Lina, I can't find my glasses anywhere.", ar: 'يا لينا، لا أجد نظارتي في أي مكان.' } },
      { s: 1, text: { es: '¿Has mirado en la cocina, junto al café?', en: 'Have you looked in the kitchen, next to the coffee?', ar: 'هل بحثت في المطبخ، بجانب القهوة؟' } },
      { s: 0, text: { es: 'Sí, y en el dormitorio también. Nada.', en: 'Yes, and in the bedroom too. Nothing.', ar: 'نعم، وفي غرفة النوم أيضاً. لا شيء.' } },
      { s: 1, text: { es: 'Hugo… ¡las llevas en la cabeza!', en: "Hugo… they're on top of your head!", ar: 'يا هوغو… إنها فوق رأسك!' } },
    ],
    topic: { es: 'Unas gafas perdidas', en: 'Lost glasses', ar: 'نظارة ضائعة' },
    wrongTopics: [
      { es: 'Preparar la cena', en: 'Making dinner', ar: 'تحضير العشاء' },
      { es: 'Un viaje en tren', en: 'A train journey', ar: 'رحلة بالقطار' },
    ],
    events: [
      { es: 'Hugo dice que no encuentra sus gafas', en: "Hugo says he can't find his glasses", ar: 'هوغو يقول إنه لا يجد نظارته' },
      { es: 'Lina pregunta por la cocina', en: 'Lina asks about the kitchen', ar: 'لينا تسأل عن المطبخ' },
      { es: 'Hugo dice que miró en el dormitorio', en: 'Hugo says he checked the bedroom', ar: 'هوغو يقول إنه بحث في غرفة النوم' },
      { es: 'Lina ve las gafas en su cabeza', en: 'Lina sees the glasses on his head', ar: 'لينا ترى النظارة فوق رأسه' },
    ],
  },
  {
    id: 'walk',
    speakers: [SARA, HUGO],
    lines: [
      { s: 1, text: { es: '¿Damos un paseo por el parque hoy?', en: 'Shall we go for a walk in the park today?', ar: 'هل نتمشّى في الحديقة اليوم؟' } },
      { s: 0, text: { es: 'Buena idea, pero dicen que lloverá por la tarde.', en: 'Good idea, but they say it will rain this afternoon.', ar: 'فكرة جيدة، لكنهم يقولون إنها ستمطر بعد الظهر.' } },
      { s: 1, text: { es: 'Entonces vamos por la mañana, a las diez.', en: "Then let's go in the morning, at ten.", ar: 'إذن لنذهب في الصباح، في الساعة العاشرة.' } },
      { s: 0, text: { es: 'Vale. Llevaré el paraguas por si acaso.', en: "Okay. I'll take the umbrella just in case.", ar: 'حسناً. سآخذ المظلة احتياطاً.' } },
    ],
    topic: { es: 'Planear un paseo', en: 'Planning a walk', ar: 'التخطيط لنزهة' },
    wrongTopics: [
      { es: 'Pintar la casa', en: 'Painting the house', ar: 'دهان البيت' },
      { es: 'Una llamada al banco', en: 'A call to the bank', ar: 'اتصال بالبنك' },
    ],
    events: [
      { es: 'Hugo propone un paseo', en: 'Hugo suggests a walk', ar: 'هوغو يقترح نزهة' },
      { es: 'Sara avisa de la lluvia', en: 'Sara warns about rain', ar: 'سارة تنبّه إلى المطر' },
      { es: 'Hugo elige ir por la mañana', en: 'Hugo chooses to go in the morning', ar: 'هوغو يختار الذهاب صباحاً' },
      { es: 'Sara decide llevar el paraguas', en: 'Sara decides to take the umbrella', ar: 'سارة تقرر أخذ المظلة' },
    ],
  },
  {
    id: 'gift',
    speakers: [LINA, OMAR],
    lines: [
      { s: 0, text: { es: 'El sábado es el cumpleaños de Elena. ¿Qué le regalamos?', en: "Saturday is Elena's birthday. What should we give her?", ar: 'يوم السبت عيد ميلاد إيلينا. ماذا نهديها؟' } },
      { s: 1, text: { es: 'Podríamos regalarle un libro de cocina.', en: 'We could give her a cookbook.', ar: 'يمكننا أن نهديها كتاب طبخ.' } },
      { s: 0, text: { es: 'Mejor una planta. Le encanta el jardín.', en: 'A plant would be better. She loves gardening.', ar: 'النبتة أفضل. هي تحب الحديقة كثيراً.' } },
      { s: 1, text: { es: 'Tienes razón. Mañana vamos a la floristería.', en: "You're right. Tomorrow we'll go to the flower shop.", ar: 'معك حق. غداً نذهب إلى محل الزهور.' } },
    ],
    topic: { es: 'Elegir un regalo de cumpleaños', en: 'Choosing a birthday present', ar: 'اختيار هدية عيد ميلاد' },
    wrongTopics: [
      { es: 'Un problema en el trabajo', en: 'A problem at work', ar: 'مشكلة في العمل' },
      { es: 'Reservar un hotel', en: 'Booking a hotel', ar: 'حجز فندق' },
    ],
    events: [
      { es: 'Lina recuerda el cumpleaños de Elena', en: "Lina mentions Elena's birthday", ar: 'لينا تذكر عيد ميلاد إيلينا' },
      { es: 'Omar propone un libro de cocina', en: 'Omar suggests a cookbook', ar: 'عمر يقترح كتاب طبخ' },
      { es: 'Lina prefiere una planta', en: 'Lina prefers a plant', ar: 'لينا تفضّل نبتة' },
      { es: 'Deciden ir a la floristería', en: 'They decide to go to the flower shop', ar: 'يقرران الذهاب إلى محل الزهور' },
    ],
  },
];
