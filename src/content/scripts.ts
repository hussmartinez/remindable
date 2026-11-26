import type { Localized } from '@/lib/lang';

/**
 * Step by Step scripts: everyday tasks whose steps have one clear order
 * (each step needs the one before it). Culturally neutral, no pork, alcohol
 * or holiday items. Emoji are Unicode ≤ 11 so they render on older Android.
 * Each script has an `intruder`: an unrelated step to leave out at higher levels.
 */

export type Step = { emoji: string; text: Localized };
export type Script = { id: string; emoji: string; title: Localized; steps: Step[]; intruder: Step };

const s = (emoji: string, en: string, es: string, ar: string): Step => ({ emoji, text: { en, es, ar } });

export const SCRIPTS: Script[] = [
  {
    id: 'tea',
    emoji: '🍵',
    title: { en: 'Make mint tea', es: 'Preparar té con menta', ar: 'تحضير الشاي بالنعناع' },
    steps: [
      s('🚰', 'Fill the kettle with water', 'Llena el hervidor de agua', 'املأ الغلاية بالماء'),
      s('🔥', 'Boil the water', 'Hierve el agua', 'اغلِ الماء'),
      s('🌿', 'Pour it over the tea and mint', 'Échala sobre el té y la menta', 'اسكبه على الشاي والنعناع'),
      s('⏳', 'Let it brew', 'Déjalo reposar', 'اتركه حتى يتخمّر'),
      s('🍵', 'Pour the tea into a glass', 'Sirve el té en un vaso', 'صبّ الشاي في كأس'),
      s('😌', 'Sip it slowly', 'Bébelo despacio', 'اشربه على مهل'),
    ],
    intruder: s('🧦', 'Put on your socks', 'Ponte los calcetines', 'البس جواربك'),
  },
  {
    id: 'hands',
    emoji: '🧼',
    title: { en: 'Wash your hands', es: 'Lavarse las manos', ar: 'غسل اليدين' },
    steps: [
      s('🚰', 'Turn on the tap', 'Abre el grifo', 'افتح الصنبور'),
      s('💧', 'Wet your hands', 'Mójate las manos', 'بلّل يديك'),
      s('🧼', 'Rub in the soap', 'Frótate con jabón', 'افرك يديك بالصابون'),
      s('👐', 'Rinse off the soap', 'Aclara el jabón', 'اشطف الصابون'),
      s('🙌', 'Dry your hands', 'Sécate las manos', 'جفّف يديك'),
    ],
    intruder: s('📺', 'Turn on the TV', 'Enciende la tele', 'شغّل التلفاز'),
  },
  {
    id: 'letter',
    emoji: '✉️',
    title: { en: 'Post a letter', es: 'Enviar una carta', ar: 'إرسال رسالة بالبريد' },
    steps: [
      s('✍️', 'Write the letter', 'Escribe la carta', 'اكتب الرسالة'),
      s('✉️', 'Put it in an envelope', 'Métela en un sobre', 'ضعها في ظرف'),
      s('🏷️', 'Stick on a stamp', 'Pega un sello', 'الصق طابعاً'),
      s('🚶', 'Walk to the post box', 'Camina hasta el buzón', 'امشِ إلى صندوق البريد'),
      s('📮', 'Drop it in the post box', 'Échala al buzón', 'ضعها في صندوق البريد'),
    ],
    intruder: s('🎈', 'Blow up a balloon', 'Infla un globo', 'انفخ بالوناً'),
  },
  {
    id: 'pill',
    emoji: '💊',
    title: { en: 'Take a pill with water', es: 'Tomar una pastilla con agua', ar: 'تناول حبة دواء مع الماء' },
    steps: [
      s('📋', 'Check the time on your list', 'Mira la hora en tu lista', 'انظر إلى الموعد في قائمتك'),
      s('💊', 'Take one pill out of the box', 'Saca una pastilla de la caja', 'أخرج حبة من العلبة'),
      s('👄', 'Put it in your mouth', 'Ponla en la boca', 'ضعها في فمك'),
      s('🥛', 'Swallow it with water', 'Trágala con agua', 'ابلعها مع الماء'),
      s('✅', 'Tick it off on your list', 'Márcala en tu lista', 'ضع علامة عليها في قائمتك'),
    ],
    intruder: s('🎣', 'Go fishing', 'Ve a pescar', 'اذهب للصيد'),
  },
  {
    id: 'seed',
    emoji: '🌱',
    title: { en: 'Plant a seed', es: 'Plantar una semilla', ar: 'زراعة بذرة' },
    steps: [
      s('⛏️', 'Dig a small hole', 'Cava un hoyo pequeño', 'احفر حفرة صغيرة'),
      s('🌰', 'Drop in the seed', 'Echa la semilla', 'ضع البذرة فيها'),
      s('🤲', 'Cover it with soil', 'Cúbrela con tierra', 'غطّها بالتراب'),
      s('💧', 'Water it', 'Riégala', 'اسقِها بالماء'),
      s('🌱', 'Watch it sprout', 'Mira cómo brota', 'راقبها وهي تنبت'),
    ],
    intruder: s('🎸', 'Play the guitar', 'Toca la guitarra', 'اعزف على الغيتار'),
  },
  {
    id: 'sandwich',
    emoji: '🥪',
    title: { en: 'Make a sandwich', es: 'Hacer un bocadillo', ar: 'تحضير شطيرة' },
    steps: [
      s('🍞', 'Take two slices of bread', 'Coge dos rebanadas de pan', 'خذ شريحتين من الخبز'),
      s('🧀', 'Add cheese and tomato', 'Pon queso y tomate', 'أضف الجبن والطماطم'),
      s('🥪', 'Close it with the other slice', 'Ciérralo con la otra rebanada', 'غطّها بالشريحة الأخرى'),
      s('🔪', 'Cut it in half', 'Córtalo por la mitad', 'اقطعها نصفين'),
      s('😋', 'Eat it', 'Cómetelo', 'كُلها'),
    ],
    intruder: s('⚽', 'Kick the ball', 'Patea la pelota', 'اركل الكرة'),
  },
  {
    id: 'clothes',
    emoji: '🧺',
    title: { en: 'Wash clothes', es: 'Lavar la ropa', ar: 'غسل الملابس' },
    steps: [
      s('🧺', 'Collect the dirty clothes', 'Junta la ropa sucia', 'اجمع الملابس المتّسخة'),
      s('👕', 'Put them in the machine', 'Métela en la lavadora', 'ضعها في الغسالة'),
      s('🌀', 'Start the wash', 'Pon la lavadora en marcha', 'شغّل الغسالة'),
      s('☀️', 'Hang them up to dry', 'Tiéndela para que se seque', 'انشرها لتجفّ'),
      s('👚', 'Fold the dry clothes', 'Dobla la ropa seca', 'اطوِ الملابس الجافة'),
    ],
    intruder: s('🎨', 'Paint a picture', 'Pinta un cuadro', 'ارسم لوحة'),
  },
  {
    id: 'doctor',
    emoji: '🏥',
    title: { en: 'Go to the doctor', es: 'Ir al médico', ar: 'زيارة الطبيب' },
    steps: [
      s('📝', 'Write down your questions', 'Apunta tus preguntas', 'اكتب أسئلتك'),
      s('🎒', 'Put them in your bag', 'Guárdalas en el bolso', 'ضعها في حقيبتك'),
      s('🚌', 'Take the bus to the clinic', 'Toma el autobús al centro de salud', 'اركب الحافلة إلى العيادة'),
      s('🏥', 'Check in at the desk', 'Avisa en recepción', 'سجّل وصولك في الاستقبال'),
      s('💬', 'Ask the doctor your questions', 'Haz tus preguntas al médico', 'اسأل الطبيب أسئلتك'),
      s('📅', 'Book the next visit', 'Pide la próxima cita', 'احجز الموعد التالي'),
    ],
    intruder: s('🧩', 'Do a jigsaw puzzle', 'Haz un rompecabezas', 'ركّب أحجية الصور'),
  },
  {
    id: 'call',
    emoji: '📞',
    title: { en: 'Call a friend', es: 'Llamar a un amigo', ar: 'الاتصال بصديق' },
    steps: [
      s('📱', 'Pick up your phone', 'Coge el teléfono', 'أمسك هاتفك'),
      s('📒', "Find your friend's number", 'Busca el número de tu amigo', 'ابحث عن رقم صديقك'),
      s('📞', 'Call and wait for an answer', 'Llama y espera la respuesta', 'اتصل وانتظر الرد'),
      s('👋', 'Say hello', 'Saluda', 'ألقِ التحية'),
      s('💬', 'Chat for a while', 'Conversa un rato', 'تحدّث معه قليلاً'),
      s('📴', 'Say goodbye and hang up', 'Despídete y cuelga', 'ودّعه وأنهِ المكالمة'),
    ],
    intruder: s('🐟', 'Feed the fish', 'Da de comer a los peces', 'أطعم السمك'),
  },
  {
    id: 'street',
    emoji: '🚦',
    title: { en: 'Cross the street', es: 'Cruzar la calle', ar: 'عبور الشارع' },
    steps: [
      s('🦓', 'Go to the zebra crossing', 'Ve al paso de cebra', 'اذهب إلى ممرّ المشاة'),
      s('✋', 'Stop at the kerb', 'Párate en el bordillo', 'قف عند حافة الرصيف'),
      s('🚦', 'Wait for the green light', 'Espera el semáforo verde', 'انتظر الإشارة الخضراء'),
      s('👀', 'Look both ways', 'Mira a los dos lados', 'انظر إلى الجهتين'),
      s('🚶', 'Cross the street', 'Cruza la calle', 'اعبر الشارع'),
    ],
    intruder: s('🧶', 'Knit a scarf', 'Teje una bufanda', 'احِك وشاحاً'),
  },
  {
    id: 'teeth',
    emoji: '🦷',
    title: { en: 'Brush your teeth', es: 'Lavarse los dientes', ar: 'تنظيف الأسنان' },
    steps: [
      s('🧴', 'Put toothpaste on the brush', 'Pon pasta en el cepillo', 'ضع المعجون على الفرشاة'),
      s('🦷', 'Brush all your teeth', 'Cepíllate todos los dientes', 'نظّف كل أسنانك بالفرشاة'),
      s('👄', 'Spit out the foam', 'Escupe la espuma', 'ابصق الرغوة'),
      s('💧', 'Rinse your mouth', 'Enjuágate la boca', 'اشطف فمك'),
      s('😁', 'Smile in the mirror', 'Sonríe al espejo', 'ابتسم أمام المرآة'),
    ],
    intruder: s('🚲', 'Ride a bike', 'Monta en bici', 'اركب الدراجة'),
  },
  {
    id: 'plants',
    emoji: '🌿',
    title: { en: 'Water the plants', es: 'Regar las plantas', ar: 'سقي النباتات' },
    steps: [
      s('👆', 'Feel if the soil is dry', 'Toca la tierra: ¿está seca?', 'المس التربة: هل هي جافة؟'),
      s('🚰', 'Fill the watering can', 'Llena la regadera', 'املأ إبريق السقي'),
      s('🌱', 'Water the soil slowly', 'Riega la tierra despacio', 'اسقِ التربة ببطء'),
      s('🧽', 'Wipe up any spilled water', 'Seca el agua que se ha caído', 'امسح الماء المسكوب'),
    ],
    intruder: s('🎤', 'Sing into a microphone', 'Canta con un micrófono', 'غنِّ في الميكروفون'),
  },
  {
    id: 'table',
    emoji: '🍽️',
    title: { en: 'Set the table', es: 'Poner la mesa', ar: 'تجهيز المائدة' },
    steps: [
      s('🧽', 'Wipe the table', 'Limpia la mesa', 'امسح الطاولة'),
      s('🍽️', 'Put out the plates', 'Pon los platos', 'ضع الصحون'),
      s('🍴', 'Put a fork by each plate', 'Pon un tenedor junto a cada plato', 'ضع شوكة بجانب كل صحن'),
      s('🍲', 'Serve the food on the plates', 'Sirve la comida en los platos', 'قدّم الطعام في الصحون'),
      s('😋', 'Eat together', 'Comed todos juntos', 'تناولوا الطعام معاً'),
    ],
    intruder: s('🏊', 'Go for a swim', 'Ve a nadar', 'اذهب للسباحة'),
  },
  {
    id: 'bank',
    emoji: '🏦',
    title: { en: 'Get cash at the bank', es: 'Sacar dinero en el banco', ar: 'سحب النقود من البنك' },
    steps: [
      s('👛', 'Take your card out of your wallet', 'Saca la tarjeta de la cartera', 'أخرج بطاقتك من المحفظة'),
      s('🏧', 'Put it in the cash machine', 'Métela en el cajero', 'أدخلها في الصراف الآلي'),
      s('🔢', 'Type your PIN', 'Teclea tu número secreto', 'اكتب رقمك السري'),
      s('💵', 'Choose the amount', 'Elige la cantidad', 'اختر المبلغ'),
      s('↩️', 'Take back your card', 'Recoge la tarjeta', 'استرجع بطاقتك'),
      s('💰', 'Take the money', 'Coge el dinero', 'خذ النقود'),
    ],
    intruder: s('🐈', 'Stroke the cat', 'Acaricia al gato', 'داعب القطة'),
  },
  {
    id: 'phone',
    emoji: '🔋',
    title: { en: 'Charge the phone', es: 'Cargar el teléfono', ar: 'شحن الهاتف' },
    steps: [
      s('🔋', 'See that the battery is low', 'Ves que queda poca batería', 'ترى أن البطارية ضعيفة'),
      s('🔌', 'Plug in the charger and phone', 'Enchufa el cargador y el teléfono', 'صِل الشاحن بالهاتف والكهرباء'),
      s('⏳', 'Wait until it is full', 'Espera a que se cargue', 'انتظر حتى يكتمل الشحن'),
      s('✅', 'Unplug the phone', 'Desconecta el teléfono', 'افصل الهاتف'),
    ],
    intruder: s('🦆', 'Feed the ducks', 'Da de comer a los patos', 'أطعم البط'),
  },
  {
    id: 'bread',
    emoji: '🍞',
    title: { en: 'Bake bread', es: 'Hacer pan', ar: 'إعداد الخبز في البيت' },
    steps: [
      s('🌾', 'Put flour in a bowl', 'Pon harina en un bol', 'ضع الطحين في وعاء'),
      s('💧', 'Add water and yeast', 'Añade agua y levadura', 'أضف الماء والخميرة'),
      s('👐', 'Knead the dough', 'Amasa la masa', 'اعجن العجين'),
      s('⏳', 'Let it rise', 'Deja que suba', 'اتركه حتى يختمر'),
      s('🔥', 'Bake it in the oven', 'Hornéala', 'اخبزه في الفرن'),
      s('🍞', 'Let it cool, then slice it', 'Deja que se enfríe y córtalo', 'اتركه يبرد ثم قطّعه'),
    ],
    intruder: s('🏓', 'Play table tennis', 'Juega al ping-pong', 'العب كرة الطاولة'),
  },
  {
    id: 'pack',
    emoji: '🧳',
    title: { en: 'Pack a bag for a trip', es: 'Hacer la maleta', ar: 'تجهيز حقيبة السفر' },
    steps: [
      s('📝', 'Make a list', 'Haz una lista', 'اكتب قائمة'),
      s('🧳', 'Open the suitcase', 'Abre la maleta', 'افتح الحقيبة'),
      s('👕', 'Put in the clothes on the list', 'Mete la ropa de la lista', 'ضع الملابس التي في القائمة'),
      s('🔒', 'Close the suitcase', 'Cierra la maleta', 'أغلق الحقيبة'),
      s('🚕', 'Take it to the taxi', 'Llévala al taxi', 'خذها إلى سيارة الأجرة'),
    ],
    intruder: s('🎹', 'Play the piano', 'Toca el piano', 'اعزف على البيانو'),
  },
  {
    id: 'bed',
    emoji: '🛏️',
    title: { en: 'Make the bed', es: 'Hacer la cama', ar: 'ترتيب السرير' },
    steps: [
      s('🧺', 'Take off the used sheets', 'Quita las sábanas usadas', 'انزع الشراشف المستعملة'),
      s('🛏️', 'Put on a clean sheet', 'Pon una sábana limpia', 'ضع شرشفاً نظيفاً'),
      s('✨', 'Spread the blanket on top', 'Extiende la manta encima', 'افرد البطانية فوقه'),
      s('👐', 'Put the pillows on top', 'Coloca las almohadas', 'ضع الوسائد في مكانها'),
    ],
    intruder: s('🎯', 'Throw a dart', 'Lanza un dardo', 'ارمِ سهماً على الهدف'),
  },
];
