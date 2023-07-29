CREATE TABLE
  `books` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `title` varchar(255) NOT NULL,
    `cover_url` varchar(255) NOT NULL,
    `author` varchar(255) NOT NULL,
    `price` int NOT NULL,
    `description` text NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 6 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
  `orders` (
    `id` bigint NOT NULL,
    `order_date` datetime(6) DEFAULT NULL,
    `status` int NOT NULL,
    `user_id` int NOT NULL,
    `books` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`id`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
  `payment` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `order_id` int NOT NULL,
    `user_id` int NOT NULL,
    `amount` int NOT NULL,
    `status` int NOT NULL DEFAULT '0',
    `payed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 7 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
  `users` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `username` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;


-- init books data --
insert into `books` (`author`, `cover_url`, `created_at`, `description`, `id`, `price`, `title`) values ('[美] 克里斯·米勒', 'https://pic.arkread.com/cover/ebook/f/437411510.1688614635.jpg!cover_default.jpg', '2023-07-25 07:25:22', '一部芯片的发展史与竞争史！追溯半导体产业发展历程，直面大国博弈下的芯片竞争格局！\n\n《金融时报》2022年度最佳商业图书、《经济学人》2022年度最佳图书、《纽约时报》畅销书\n\n2023年专业出版商杰出作品奖、入围莱昂内尔·盖尔伯奖、腾讯研究院2023年新春书单\n\n1.一本书读懂芯片发展史与竞争史。\n\n2.本书将宏大话题写得通俗易懂。\n\n3.本书对理解当今世界至关重要。\n\n4.本书获中外知名人士重磅推荐。\n\n芯片是现代世界赖以生存的稀缺资源，就像石油一样。如今，军事、经济和地缘政治力量都建立在芯片的基础上。从制导导弹到微波炉，从智能手机到股票市场，一切都离不开芯片。谁在芯片设计和制造领域保持领先地位，谁就能在科技和经济等领域产生巨大的优势。长期以来，美国、日本、韩国以及欧洲各国，都在芯片设计和制造领域进行激烈的竞争，以图赢得这场立足于科技之上的战争。\n\n经济历史学家克里斯·米勒在书中较为完整地描述了各国为控制芯片技术而进行的长达数十年的斗争历程，解释了半导体在现代生活中发挥的关键作用，以及美国是如何在芯片设计和制造中占据主导地位，并将这种技术应用于军事系统的。\n\n本书集科技冒险、商战故事、大国博弈于一体，分析了芯片崛起的历史，以及以控制芯片行业的未来为目的的日益复杂的地缘政治权力斗争，对理解当今的政治、经济和和科技至关重要。\n\n克里斯·米勒（Chris Miller），美国塔夫茨大学弗莱彻学院国际史副教授，美国企业研究所珍妮·科克帕特里克（Jeane Kirkpatrick）客座研究员，美国外交政策研究所欧亚区主任，宏观经济与地缘政治咨询公司格林曼特主任。《纽约时报》《华尔街日报》等媒体特约撰稿人。拥有耶鲁大学历史学博士学位和哈佛大学历史学学士学位。\n\n蔡树军，美国加州大学洛杉矶分校（UCLA）电子工程系博士。曾任教于香港科技大学，讲授集成电路原理及制造等课程。现任中国电子科技集团公司某研究所所长。长期从事半导体研究工作，已联合发表专业论文200余篇。曾以第一完成人获2019年度“国家科学技术进步奖”一等奖，2021年获中共中央组织部等部委颁发的“全国杰出专业技术人才”称号。', 1, 5280, '芯片战争');
insert into `books` (`author`, `cover_url`, `created_at`, `description`, `id`, `price`, `title`) values ('胡安焉', 'https://pic.arkread.com/cover/ebook/f/433885140.1685691440.jpg!cover_default.jpg', '2023-07-25 07:51:21', '进入社会工作至今的二十年间，胡安焉走南闯北，辗转于广东、广西、云南、上海、北京等地，做过快递员、夜班拣货工人、便利店店员、保安、自行车店销售、服装店销售、加油站加油工……他将日常的点滴和工作的甘苦化作真诚的自述，记录了一个平凡人在生活中的辛劳、私心、温情、正气。\n\n在物流公司夜间拣货的一年，给他留下了深刻的生理印记：“这份工作还会令人脾气变坏，因为长期熬夜以及过度劳累，人的情绪控制力会明显下降……我已经感到脑子不好使了，主要是反应变得迟钝，记忆力开始衰退。”在北京送快递的两年，他“把自己看作一个时薪30元的送货机器，达不到额定产出值就恼羞成怒、气急败坏”……\n\n但他最终认识到，怀着怨恨的人生是不值得过的。这些在事后追忆中写成的工作经历，渗透着他看待生活和世界的态度与反思，旨在表达个人在有限的选择和局促的现实中，对生活意义的直面和肯定：生活中许多平凡隽永的时刻，要比现实困扰的方方面面对人生更具有决定意义。\n\n胡安焉，打工人，写作者。近二十年间走南闯北，辗转于广东、广西、云南、上海、北京等地，现定居成都。早年间做过保安、面包店学徒、便利店店员、自行车店销售、服装店导购、网店工作人员等；近年在广东的物流公司做过夜班拣货工人，后又在北京做了两年快递员。2020年至今，待业在家。', 2, 1990, '我在北京送快递');
insert into `books` (`author`, `cover_url`, `created_at`, `description`, `id`, `price`, `title`) values ('陈儒', 'https://pic.arkread.com/cover/ebook/f/1499455.1653713217.jpg!cover_default.jpg', '2023-07-25 08:30:34', '作为主流的动态语言，Python不仅简单易学、移植性好，而且拥有强大丰富的库的支持。此外，Python强大的可扩展性，让开发人员既可以非常容易地利用C/C++编写Python的扩展模块，还能将Python嵌入到C/C++程序中，为自己的系统添加动态扩展和动态编程的能力。\n\n为了更好地利用Python语言，无论是使用Python语言本身，还是将Python与C/C++交互使用，深刻理解Python的运行原理都是非常重要的。本书以CPython为研究对象，在C代码一级，深入细致地剖析了Python的实现。书中不仅包括了对大量Python内置对象的剖析，更将大量的篇幅用于对Python虚拟机及Python高级特性的剖析。通过此书，读者能够透彻地理解Python中的一般表达式、控制结构、异常机制、类机制、多线程机制、模块的动态加载机制、内存管理机制等核心技术的运行原理，同时，本书所揭示的动态语言的核心技术对于理解其他动态语言，如 Javascript、Ruby等也有较大的参考价值。\n\n本书适合于Python程序员、动态语言爱好者、C程序员阅读。\n\n陈儒，计算机科学与工程专业硕士，问天（北京）信息技术有限公司技术负责人，致力于信息检索方向的研究与开发。', 3, 3839, 'Python源码剖析');
insert into `books` (`author`, `cover_url`, `created_at`, `description`, `id`, `price`, `title`) values ('黄有璨', 'https://pic.arkread.com/cover/ebook/f/35649285.1653705109.jpg!cover_default.jpg', '2023-07-25 08:32:34', '在互联网行业内，“运营”这个职能发展到一定阶段后，往往更需要有成熟的知识体系和工作方法来给予行业从业者以指引。\n\n《运营之光：我的互联网运营方法论与自白2.0》尤其难得之处在于：它既对“什么是运营”这样的概念认知类问题进行了解读，又带有大量实际的工作技巧、工作思维和工作方法，还包含了很多对于运营的思考、宏观分析和建议，可谓内容完整而全面，同时书中加入了作者亲历的大量真实案例，让全书读起来深入浅出、耐人寻味。\n\n黄有璨\n\n互联网运营从业近10年，曾先后就职于美国About.com、第九课堂、新浪微米、周伯通招聘等互联网公司，历任运营经理、COO助理、COO等职。\n\n现任互联网人在线学习社区三节课（sanjieke.cn）联合创始人。\n\n同时为36氪、百度百家等专栏作家，多篇关于运营的文章被疯转，个人文章仅2016年累计线上浏览量达2000万。小饭桌创业课堂创业导师。', 4, 2065, '运营之光');
insert into `books` (`author`, `cover_url`, `created_at`, `description`, `id`, `price`, `title`) values ('[美] A.G.利德尔', 'https://pic.arkread.com/cover/ebook/f/439349284.1690440537.jpg!cover_default.jpg', '2023-07-29 04:06:06', '永生不再是神话，而是选择\n\n●《亚特兰蒂斯》作者A.G.利德尔\n\n●颠覆想象的史诗级科幻巨著完结篇\n\n●入围威尔伯·史密斯出版小说奖\n\n《卫报》《每日邮报》《出版人周刊》热血推荐\n\n●神秘大BOSS登场，封存记忆，重启时间\n\n末世之战，一触即发\n\n人类的每一次绝地反击，都是对宇宙的重置！\n\n“漫长的寒冬”三部曲完结篇热血来袭！500万人类幸存者来到新家园厄俄斯，然而这里并非天堂，他们面临着更大的挑战：超强风暴、远古巨兽、嗜血狂蝎、致命孢子……人类能否逃出生天？与此同时，幕后大BOSS网格的真相越来越逼近。失踪的移民、地底的巨型球体、神秘的图形，它们与网格有何关系？留给人类的时间不多了，末日之战，一触即发，宇宙将复归寂灭，还是重焕生机？\n\nA.G.利德尔，美国新生代科幻小说家，毕业于北卡罗来纳大学教堂山分校，从事互联网行业长达十年，现专职写作。他的小说处女作《亚特兰蒂斯：人类起源三部曲》一经面世便引起轰动，迅速登上亚马逊科幻小说榜，版权销售至多个国家和地区。另有《逃离2147》《大灭绝档案》等作品。', 5, 2950, '漫长的寒冬：失落之城');
