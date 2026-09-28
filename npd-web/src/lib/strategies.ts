export interface Strategy {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  definition: string;
  mechanism: string;
  examples: string[];
  counterExamples: { text: string; diff: string }[];
  responses: string[];
  related: string[];
  keywords: string[];
}

export const STRATEGIES: Strategy[] = [
  {
    id: "gaslight",
    slug: "gaslighting",
    name: "煤气灯效应",
    blurb: "让你怀疑自己的记忆",
    definition:
      "通过否认、歪曲、淡化你的感受，让你逐渐不信任自己的记忆与判断，只能依赖对方给出的版本。",
    mechanism:
      "反复被否认后，你会停止相信自己的感官，把「有问题的人」的位置让给对方。",
    examples: [
      "「你太敏感了，我从没说过那句话。」",
      "「又来了，你就爱无中生有。」",
      "「我要是真这样，你早走了，不是吗？」",
    ],
    counterExamples: [
      {
        text: "「我不记得我那样说过，我们看下聊天记录？」",
        diff: "愿意核对事实，而不是断言你的记忆是错的。",
      },
      {
        text: "「你说的那件事，我的记忆和你不一样，但我相信你感受到的。」",
        diff: "承认感受，不否定你这个人。",
      },
    ],
    responses: [
      "「我记忆里的事实是这样，我可以接受我们看法不同，但我的感受是真实的。」",
      "不在对方的否认里反复自证，只说一次，然后离开这个话题。",
      "把这件事记进锚点日记，形成可回看的对照。",
    ],
    related: ["belittling", "victimhood"],
    keywords: [
      "太敏感",
      "从没说过",
      "你想多了",
      "想多了",
      "记错",
      "记错了",
      "无中生有",
      "神经质",
      "又来了",
      "翻旧账",
      "你疯了",
      "不存在",
      "没发生过",
    ],
  },
  {
    id: "lovebombing",
    slug: "love-bombing",
    name: "爱轰炸",
    blurb: "用超额的好制造亏欠",
    definition:
      "在关系初期用远超正常节奏的赞美、承诺与付出，让你快速产生亏欠感，之后任何拒绝都显得「不识好歹」。",
    mechanism:
      "「好得无法拒绝」本身就是一种控制——亏欠感让你在冲突时不敢提要求、不敢离开。",
    examples: [
      "「你是我这辈子遇到的最懂我的人。」",
      "「才认识两周，我已经把你写进我的未来了。」",
      "「我为你辞了工作搬过来，你忍心这样对我？」",
    ],
    counterExamples: [
      {
        text: "「我很喜欢你，但我觉得我们还是要按正常的节奏了解彼此。」",
        diff: "热情但不越界，尊重关系发展的自然速度。",
      },
    ],
    responses: [
      "警惕节奏过快的承诺，把重大决定放缓到冷静期再做。",
      "明确「不因亏欠而迁就」：付出是礼物，不是欠条。",
    ],
    related: ["intermittent", "futurefaking"],
    keywords: [
      "一辈子",
      "唯一",
      "最懂我",
      "命中注定",
      "为你放弃",
      "为你辞职",
      "把你写进未来",
      "离不开你",
    ],
  },
  {
    id: "belittling",
    slug: "belittling",
    name: "贬低",
    blurb: "系统性拆掉你的自尊",
    definition:
      "通过持续的否定、嘲讽、贬损，让你逐渐相信自己「不够好、不值钱、离不开他」。",
    mechanism:
      "自尊被拆掉后，你会把「留下来证明自己」当成唯一选择——这正是他要的。",
    examples: [
      "「离开我谁还要你？」",
      "「你这份工作要不是我，你早就被开了。」",
      "「你看看别人家的，再看看你。」",
    ],
    counterExamples: [
      {
        text: "「这件事我不认同你的处理，但我们谈谈怎么改。」",
        diff: "批评具体行为，不否定你这个人。",
      },
    ],
    responses: [
      "识别到贬低即声明：「请用具体事实说话，不要对我下定义。」",
      "不参与「比谁更差」的游戏，回到当下议题。",
      "记录贬低发生的频次，让模式显形。",
    ],
    related: ["gaslight", "triangulation"],
    keywords: ["谁还要你", "你看看别人家", "废物", "没用", "不配", "不值得"],
  },
  {
    id: "triangulation",
    slug: "triangulation",
    name: "三角测量",
    blurb: "引入第三方让你比较",
    definition:
      "在你面前引入第三方（前任、家人、同事），让你因比较而不安，从而更努力地证明自己、更顺从。",
    mechanism:
      "自尊被架在比较台上，你开始证明「我比 TA 好」，而证明即入局。",
    examples: [
      "「我前女友从来不会为这种事发脾气。」",
      "「你问问小李，看我平时对你算不算好的。」",
      "「我妈说你这样下去没人受得了你。」",
    ],
    counterExamples: [
      {
        text: "「我朋友也遇到过类似情况，他后来是这样处理的。」",
        diff: "分享经验而非拿你比较。",
      },
      {
        text: "「我们找个咨询师一起聊聊吧。」",
        diff: "引入专业者而非竞争者。",
      },
    ],
    responses: [
      "识别到即可声明：「请不要拿别人和我比较。」",
      "不参与「比拼」，回到当下议题。",
      "记录发生频次，一键存入锚点日记。",
    ],
    related: ["belittling", "isolation"],
    keywords: ["前任从来不", "某某就不会", "别人都能", "你怎么不像"],
  },
  {
    id: "darvo",
    slug: "darvo",
    name: "DARVO",
    blurb: "反转受害者与施害者",
    definition:
      "Deny（否认）→ Attack（攻击）→ Reverse Victim and Offender（反转受害与加害）。你指出问题，他反而指责你才是问题制造者。",
    mechanism:
      "把「受害者」的位置抢走，你从被伤害的人变成被指责的人，只能先安抚他而顾不上自己。",
    examples: [
      "「我吼你是因为你逼我的，都是你先惹我。」",
      "「你要是正常一点，我会这样吗？」",
      "「你现在这样指责我，就是在伤害我。」",
    ],
    counterExamples: [
      {
        text: "「我刚才确实做得不好，我道歉。你那边发生了什么？」",
        diff: "承担自己的部分，同时保有你的立场。",
      },
    ],
    responses: [
      "不上钩：「我们先不讨论谁对谁错，先把我提出的这件事处理完。」",
      "把「谁先惹谁」的议题搁置，坚持事实与时间线。",
    ],
    related: ["victimhood", "gaslight"],
    keywords: ["都是你逼的", "你先惹我", "你要是正常", "你伤害我", "谁让你"],
  },
  {
    id: "hoovering",
    slug: "hoovering",
    name: "回吸",
    blurb: "离开后又把你拉回来",
    definition:
      "你离开或冷落时，对方用道歉、示弱、威胁或突如其来的深情，像吸尘器一样把你吸回关系。",
    mechanism:
      "「忽冷忽热」制造间歇性奖赏，回吸期短暂的甜会强化你对关系的上瘾回路。",
    examples: [
      "「没有你我真的活不下去。」",
      "「我突然发现自己错了，我们重新开始好不好？」",
      "「你要是不回来，我就去你们公司楼下等你。」",
    ],
    counterExamples: [
      {
        text: "「我认真想过我们之间的问题，我列了具体的改变清单，你愿意一起看吗？」",
        diff: "改变指向具体行为，而不是空泛的深情与威胁。",
      },
    ],
    responses: [
      "回吸高峰期先开启灯塔 90 秒缓冲，不立刻回复。",
      "把回吸信息存证，对照你离开时写下的理由。",
    ],
    related: ["intermittent", "futurefaking"],
    keywords: [
      "没有你活不下去",
      "重新开始",
      "我错了",
      "等你",
      "我来你公司",
      "最后一次机会",
    ],
  },
  {
    id: "flyingmonkeys",
    slug: "flying-monkeys",
    name: "飞猴",
    blurb: "借他人之手施压围攻",
    definition:
      "自己不直接动手，而是动员亲友、共同圈子的人来游说、指责或监视你，形成「所有人都觉得你错了」的包围。",
    mechanism:
      "孤立无援时，你会把「他们说的可能有道理」当成解药，放弃自己的判断。",
    examples: [
      "「你妈妈特地来劝你，你还不领情？」",
      "「我们几个朋友都一致觉得你这次做得过分了。」",
      "「你看大家多关心你，就你不知好歹。」",
    ],
    counterExamples: [
      {
        text: "「我找我朋友聊了我的处境，他帮我理清了思路。」",
        diff: "把外部支持作为资源，而非压力来源。",
      },
    ],
    responses: [
      "识别即声明：「请不要让别人来代替你跟我说话。」",
      "只与当事人沟通，不回应第三方传话。",
    ],
    related: ["isolation", "triangulation"],
    keywords: ["你妈说", "大家都觉得", "朋友都说", "某某特地来劝"],
  },
  {
    id: "stontreatment",
    slug: "stonewalling",
    name: "沉默惩罚",
    blurb: "用冷暴力逼你低头",
    definition:
      "以连续数小时、数天甚至更久的无视、不回应、消失，来惩罚你「说错话」，直到你道歉或让步。",
    mechanism:
      "你的焦虑会被沉默喂养：为了终结这种被抛弃的恐惧，你会越来越快地让步。",
    examples: [
      "（连续三天不回复你，见面也不看你）",
      "「我现在不想跟你说话。」然后失联一周。",
      "你发消息他回「。」，你问怎么了，他继续消失。",
    ],
    counterExamples: [
      {
        text: "「我需要一点空间冷静一下，今晚我们再好好聊。」",
        diff: "暂停有明确时长与回程，而不是无限期消失。",
      },
    ],
    responses: [
      "把「等待回复」变成自己的时间，不追问、不刷屏。",
      "设定底线：「持续失联超过 X 天，我会视为关系结束的表示。」",
    ],
    related: ["intermittent", "hoovering"],
    keywords: ["连续不回", "消失", "冷暴力", "不想说话", "哦", "。"],
  },
  {
    id: "victimhood",
    slug: "victim-playing",
    name: "受害者扮演",
    blurb: "把自己演成可怜人让你愧疚",
    definition:
      "把一切冲突都解释成「你在伤害我」，用自责、哭泣、生病或旧伤，让你在愧疚中撤回要求。",
    mechanism:
      "愧疚是最有效的刹车——你一有离开的念头，就先被「我伤害了对方」的罪恶感拦住。",
    examples: [
      "「我为你付出了这么多，你就这样回报我。」",
      "「我这颗心早就被你伤透了。」",
      "「行，都是我的错，我走了，你们都能松口气了。」",
    ],
    counterExamples: [
      {
        text: "「我的付出是我愿意的，不代表你欠我什么。」",
        diff: "付出不索取回报，才是健康的给予。",
      },
    ],
    responses: [
      "区分「他的痛苦」与「他的责任」：受伤不等于全对。",
      "对「付出账单」不认领：「你的付出是你当初的选择。」",
    ],
    related: ["darvo", "hoovering"],
    keywords: [
      "付出这么多",
      "伤透了心",
      "你们都好",
      "我走",
      "我错了我走",
    ],
  },
  {
    id: "intermittent",
    slug: "intermittent-reinforcement",
    name: "间歇性强化",
    blurb: "忽好忽坏让你上瘾",
    definition:
      "表现时好时坏、无规律可循：偶尔的好是「奖赏」，多数时候的坏是「惩罚」，这种随机性最让人上瘾与焦虑。",
    mechanism:
      "随机奖赏激活的是赌徒式的大脑回路——你等的不是他，是下一场「可能的好」。",
    examples: [
      "他一个月不理你，却在某个深夜突然温柔地说「其实我一直想你」。",
      "每次你决定离开，他就变好两天；你留下后，一切照旧。",
      "「好的时候真的很好，所以我舍不得走。」",
    ],
    counterExamples: [
      {
        text: "「我们之间的问题，我想我们每周固定聊一次，持续改进。」",
        diff: "稳定、可预期的改进，而不是随机奖赏。",
      },
    ],
    responses: [
      "把「好」和「坏」拉长到月度尺度看趋势，而不是看单次。",
      "记录好与坏的时间点，用数据破除「其实挺不错」的滤镜。",
    ],
    related: ["hoovering", "stontreatment"],
    keywords: ["好的时候真的好", "忽好忽坏", "说变就变", "随机"],
  },
  {
    id: "isolation",
    slug: "isolation",
    name: "孤立",
    blurb: "切断你的支持网络",
    definition:
      "通过贬低你的朋友家人、制造矛盾、或让你「选边站」，逐步切断你的外部支持，让你只剩他一个出口。",
    mechanism:
      "支持网络消失后，你判断「正常与否」只能参照他一个人的标准。",
    examples: [
      "「你那些闺蜜一个个都见不得你好。」",
      "「以后你少跟你妈说我们的事，她只会添乱。」",
      "「你要去聚会，还是跟我在一起？选一个。」",
    ],
    counterExamples: [
      {
        text: "「你朋友建议我们冷静一下，我觉得她说得有点道理，我们聊聊？」",
        diff: "把外部意见当作资源而非威胁。",
      },
    ],
    responses: [
      "每周固定联系一位信任的人，哪怕只是报个平安。",
      "把「选边站」的要求视为红灯信号。",
    ],
    related: ["flyingmonkeys", "triangulation"],
    keywords: ["你那些朋友", "别跟你妈说", "选一个", "选边", "谁重要"],
  },
  {
    id: "futurefaking",
    slug: "future-faking",
    name: "未来伪造",
    blurb: "用美好承诺吊住你",
    definition:
      "描绘一个永远在「下周/下个月/明年」的宏大未来（结婚、搬家、创业、养孩子），让你为那个不存在的未来忍受现在的糟糕。",
    mechanism:
      "未来的甜蜜会抵消现在的疼痛——你一直在为「还没发生的好」付费。",
    examples: [
      "「等我把这个项目做完，我们就结婚。」（项目已经做了三年）",
      "「明年我们搬去海边，一切都重新开始。」",
      "「我说到做到，只是现在还不到时候。」",
    ],
    counterExamples: [
      {
        text: "「我们把这个月的小目标先完成，再看下一步。」",
        diff: "承诺有近期可验证的里程碑。",
      },
    ],
    responses: [
      "把每个承诺写进锚点日记，并设一个「兑现日期」回看。",
      "只以已发生的事实评估关系，不预售未来。",
    ],
    related: ["lovebombing", "hoovering"],
    keywords: [
      "等我做完这个项目",
      "明年",
      "下个月",
      "以后",
      "到时候",
      "还没到时候",
    ],
  },
];

export function getStrategyBySlug(slug: string): Strategy | undefined {
  return STRATEGIES.find((s) => s.slug === slug);
}

export function getStrategyById(id: string): Strategy | undefined {
  return STRATEGIES.find((s) => s.id === id);
}

export const VALID_STRATEGY_IDS = STRATEGIES.map((s) => s.id);
