// Central content data for the site generator (scripts/build.js).

export const SITE = {
  name: 'Rain Drains',
  domain: 'https://raindrainsva.com',
  phone: '757-807-0080',
  phoneTel: '+17578070080',
  email: 'bryson@raindrainsva.com',
  addressLocality: 'Chesapeake',
  addressRegion: 'VA',
  postalCode: '23322',
  license: 'VA Lic. 2705198697',
  rating: 5.0,
  reviewCount: 105,
  reviewCountDisplay: '100+',
  year: 2026,
  googleReviewsUrl: 'https://share.google/s1ax4TM35ErhaA5Bi',
}

export const CARE_GUIDE_URL = '/files/care-guide.pdf'

export const SOCIAL = [
  { name: 'Facebook', icon: 'facebook', url: 'https://www.facebook.com/RainDrainsLLC/' },
  { name: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/raindrainsva' },
  { name: 'YouTube', icon: 'youtube', url: 'https://www.youtube.com/channel/UC9PVz8xYLHmUYex5pLhV40g' },
  { name: 'Yelp', icon: 'yelp', url: 'https://www.yelp.com/biz/rain-drains-chesapeake' },
]

export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about-us-1/', label: 'About' },
  { href: '/services-1/', label: 'Services' },
  { href: '/past-projects/', label: 'Our Work' },
  { href: '/service-areas/', label: 'Service Areas' },
  { href: '/faq/', label: 'FAQ' },
  { href: '/contact-1/', label: 'Contact' },
]

export const SERVICES = [
  {
    slug: 'french-drain',
    name: 'French Drain Installation',
    short: 'Standing water and foundation protection — a custom-engineered French drain redirects groundwater safely off your property, permanently.',
    icon: 'drop',
    image: { src: '/img/french-drain.jpg', alt: 'French drain pipe and gravel trench installed along a home foundation' },
    body: [
      'A soggy lawn, muddy paws, and standing water against your foundation aren’t just frustrating — they’re active threats to your home’s structural integrity. Across the Hampton Roads region and northeastern North Carolina, our unique coastal climate, heavy seasonal downpours, and challenging soil types make proper subsurface water management absolutely critical.',
      'If you have areas of your yard that stay wet for days after a storm, a custom-engineered French drain system is the most reliable, permanent solution to redirect groundwater safely off your property.',
    ],
    bullets: ['Custom-sized for your soil and water volume', 'ADS-rated piping, 100-year lifespan', 'Lawn restored after installation'],
    challenges: {
      heading: 'Why Standard Yards Flood in Our Region',
      intro: 'Many homeowners assume their pooling water is just a grading issue, but the subsurface reality in our service areas requires a deeper approach. Traditional French drains fail around here if the contractor doesn’t account for local soil conditions:',
      items: [
        { title: 'The Heavy Clay Barrier', text: 'In areas like Chesapeake, Suffolk, and parts of Virginia Beach, heavy clay layers trap rainwater on the surface. Because clay doesn’t drain naturally, water moves laterally, searching for the path of least resistance — which is often right up against your foundation or crawlspace.' },
        { title: 'The High Coastal Water Table', text: 'In low-lying zones like Norfolk, Portsmouth, Hampton, and Yorktown, a naturally high water table means the ground saturates almost instantly during high tides or heavy rainfall, forcing groundwater upward.' },
        { title: 'Rapid Development & Runoff', text: 'In rapidly expanding residential zones like Moyock, Carrollton, Smithfield, and Currituck County, new construction and clearing alter natural drainage paths, dumping massive volumes of sheet-flow runoff onto established lots.' },
      ],
    },
    process: {
      heading: 'The Anatomy of a Commercial-Grade French Drain',
      intro: 'We don’t cut corners with pre-wrapped, cheap retail DIY products that collapse under the pressure of coastal soils. Our heavy-duty subsurface systems are built to withstand hydrostatic pressure — the force exerted by standing groundwater — and keep flowing clear for decades.',
      items: [
        { title: 'Precision Trenching & Slope Calibration: Excavation Phase', text: 'Using specialized turf-friendly trenching machinery, we excavate a dedicated channel with a strict downward pitch toward a safe discharge point (such as a ditch, storm main, or pop-up emitter).' },
        { title: 'Non-Woven Geotextile Fabric Lining: Silt Protection', text: 'We line the raw dirt trench with premium, commercial-grade non-woven filter fabric. This allows groundwater to seep in freely while permanently locking out fine silt, sand, and clay particles that clog inferior systems.' },
        { title: 'Solid Aggregate Bedding & Perforated Pipe: The Water Highway', text: 'We lay a foundational bed of washed #57 drainage gravel, then install heavy-duty, smooth-interior perforated pipe (or custom heavy-wall manifold piping depending on your specific volume needs) with the drill holes facing downward to scoop rising groundwater from below.' },
        { title: 'Deep Aggregate Backfill & Encapsulation: Maximizing Void Space', text: 'The entire trench is filled to the top with #57 gravel, completely surrounding the pipe. We fold the geotextile fabric over the top of the gravel like a burrito, totally encapsulating the drainage stone.' },
        { title: 'Structural Re-Grading & Finish Work: Restoration', text: 'We backfill the top few inches with clean topsoil or stone and execute a precise fine-grade so your lawn can heal beautifully, leaving no trace of the heavy work beneath.' },
      ],
    },
    faqs: [
      { q: 'Why is a French drain better than a surface catch basin for my yard?', a: 'A catch basin only grabs surface water that pools directly on top of the grate. If your yard feels like a wet sponge or stays muddy for days, your problem may be subsurface saturation. A French drain acts like an underground sponge, constantly collecting and drawing down groundwater from the entire surrounding root zone, drying the soil completely out.' },
      { q: 'Where does the collected water actually go?', a: 'Every drainage system requires a viable exit strategy. Depending on local municipal building codes and your property layout, we route the water to a legal gravity discharge point — such as a roadside drainage swale, an existing storm sewer tie-in, a sump pump tank, or a heavy-duty pop-up emitter set up near the property line away from neighboring structures.' },
      { q: 'Will a French drain wash away my coastal sand or clog with clay?', a: 'Not when it’s built right. This is why we use non-woven geotextile encapsulation. In sandy coastal soils (common in Virginia Beach and Currituck), unlined pipes fill with sand immediately. In heavy clay soils (Chesapeake and Suffolk), fine clay silt can blind a system. Our premium fabric shielding acts as a permanent barrier that only allows clean water through.' },
    ],
    areaList: {
      heading: 'Serving the Entire Tidewater & NE North Carolina Corridors',
      intro: 'Because drainage solutions are never one-size-fits-all, we custom-engineer every single system to match the exact topography and soil conditions of your specific municipality.',
      areas: ['Virginia Beach', 'Chesapeake', 'Suffolk', 'Norfolk', 'Portsmouth', 'Smithfield', 'Carrollton', 'Hampton', 'Yorktown', 'Moyock', 'Currituck County', 'Camden County'],
    },
  },
  {
    slug: 'lawn-drainage-1',
    name: 'Residential Drainage Solutions',
    short: 'Catch basins, buried downspout extensions and condensate drainage networks that intercept surface water before it saturates your lawn.',
    icon: 'home',
    image: { src: '/img/residential-drainage.jpg', alt: 'Rain Drains crew installing a residential drainage system with a mini excavator' },
    body: [
      'When heavy rain hits the Hampton Roads and Northeast North Carolina coastlines, your roof and HVAC systems generate thousands of gallons of water. If that volume isn’t explicitly managed, it collects right next to your foundation, drowns your turf, and turns your yard into an unusable marsh.',
      'While French drains handle underground water tables, surface lawn drainage networks are built to intercept torrents of water before they can saturate your soil. We design and install catch basins, buried downspout extensions, and custom condensate drainage lines to keep your property dry, solid, and safe.',
    ],
    bullets: ['Free on-site evaluation', 'Systems designed for your specific yard', 'Most jobs completed in one day'],
    subServices: {
      heading: 'Catch Basins, Downspout Extensions & Condensate Networks',
      items: [
        {
          title: 'Catch Basins: Eliminating Low-Spot Standing Water',
          intro: 'If you have a clear low point in your lawn where water naturally pools after a downpour, a catch basin is the standard solution. A catch basin sits flush with your grass or hardscape, acting as a direct drain for localized pooling.',
          bullets: [
            'Debris Trapping — As water pours through the grate, sediment and leaves settle to the bottom of the basin instead of rushing into your underground lines, preventing clogs deep inside your discharge pipes.',
            'Strategic Placement — We position these in low spots across lawns in Chesapeake and Suffolk, where clay soil prevents fast surface infiltration, giving pooling water an immediate escape route.',
          ],
        },
        {
          title: 'Buried Downspout Extensions: Moving Roof Water Away',
          intro: 'A single inch of rain on a 2,000-square-foot roof produces nearly 1,200 gallons of water. If your gutters simply dump that volume out of standard elbows at the corners of your home, you are actively washing away your foundation’s soil and flooding your crawlspace or basement. We permanently solve this by tying your downspouts directly into clean, smooth-wall rigid PVC or heavy-duty smooth-interior or corrugated ADS pipe buried underground.',
          bullets: [
            'Pipe Clogs — We avoid cheap, thin corrugated piping that traps debris, collapses under the weight of lawnmowers, and rots out. We use rigid and smooth-interior piping that maximizes water velocity and lasts for decades. Ask about our downspout filters for an even cleaner drainage system.',
            'Safe Discharge — We route your roof runoff 20, 50, or 100+ feet away from your home, daylighting the lines into a localized drainage ditch or a clean pop-up emitter near the property line — a critical defense for high-risk foundation zones like the older historic homes in Norfolk and Portsmouth, or rapidly developing lots in Virginia Beach, Chesapeake, Moyock, and Camden County.',
          ],
        },
        {
          title: 'Condensate Catch Basin Networks: Fixing Summer Mud Holes',
          intro: 'In the peak of a hot, humid Virginia or North Carolina summer, your home’s air conditioning system runs around the clock. Your HVAC unit and high-efficiency furnace continually dump gallons of water out of a small condensate line right next to your home’s foundation. During months without rain, this constant trickle keeps a localized patch of your yard permanently muddy, killing grass and creating a breeding ground for pests.',
          bullets: [
            'Continuous Low-Volume Drainage — We engineer catch basin networks or direct line tie-ins specifically to capture this persistent mechanical runoff.',
            'Foundation Shielding — Instead of letting AC condensate pool against your slab or crawlspace block, we route it safely into your main lawn drainage grid, keeping your foundation perimeter bone-dry even in July and August.',
          ],
        },
      ],
    },
    process: {
      heading: 'Engineered to Outperform Local Climate Pressures',
      intro: 'Our drainage networks are custom-built to match the exact topography and soil dynamics of your specific community:',
      items: [
        { title: 'Laser-Guided Pitch Analysis: Elevation Targeting', text: 'We calculate the exact slope from your home’s foundation to your property’s natural exit point, ensuring all underground lines maintain a strict downward pitch so water can never back up.' },
        { title: 'Smooth-Wall Trenching & Piping: Excavation', text: 'We trench clean lines and lay heavy-duty, smooth-interior rigid piping. Smooth pipes prevent debris accumulation and maintain maximum flow rate even during torrential downpours.' },
        { title: 'Inline Cleanouts & Basins: Component Integration', text: 'We install integrated inline cleanout ports (when selected) and structural catch basins, making the entire network fully accessible and easy to maintain for decades to come.' },
      ],
    },
    areaList: {
      heading: 'Localized Service Area Footprint',
      intro: 'Custom surface drainage grids for lawns across the Tidewater and northeastern North Carolina corridor.',
      areas: ['Virginia Beach', 'Chesapeake', 'Suffolk', 'Norfolk', 'Portsmouth', 'Smithfield', 'Carrollton', 'Hampton', 'Yorktown', 'Moyock', 'Currituck County', 'Camden County'],
    },
    cta: {
      heading: 'Stop fighting a muddy lawn',
      sub: 'Secure your foundation and reclaim your outdoor space before the next heavy storm system rolls through the coast. Contact us today to map out a custom surface drainage grid for your property.',
    },
  },
  {
    slug: 'commercial-drainage',
    name: 'Commercial Drainage',
    short: 'Commercial-grade PVC and HDPE stormwater networks for HOA communities, multi-family complexes and commercial properties — one accountable team from site survey to final restoration.',
    icon: 'building',
    image: { src: '/img/commercial-drainage.jpg', alt: 'Rain Drains technician installing commercial stormwater drainage pipe at a brick commercial building' },
    body: [
      'Managing commercial properties, multi-family complexes, and HOA communities across Hampton Roads requires a fast, reliable, and specialized civil contracting partner. Whether you are dealing with flooded retention pond access roads, failing parking lot catch basins, or unmanaged surface runoff destroying common areas, you don’t need a heavy municipal highway contractor to get the job done right.',
      'We specialize in commercial-grade PVC and HDPE (ADS N-12) stormwater networks, serving as a true one-stop shop for HOA board members, property management firms, and commercial facility managers. From diagnostic site surveys to final surface restoration, we handle every stage of your community’s drainage infrastructure under a single, fully accountable roof.',
      'Instead of juggling separate utility operators, excavation crews, and hardscape contractors, we streamline commercial stormwater management into a single, cohesive workflow.',
    ],
    bullets: ['Scoped for property managers, HOAs & GCs', 'Permits handled for you', 'Scheduled around business operations', 'Fully insured crews'],
    challenges: {
      eyebrow: 'Materials',
      heading: 'Heavy-Duty Commercial Piping Standards: Why PVC & N-12?',
      intro: 'While massive municipal highway jobs require heavy concrete (RCP) pipe, modern commercial footprints, apartment networks, and residential HOAs run far more efficiently on heavy-duty SDR-35 / Schedule 40 PVC and dual-wall corrugated HDPE (ADS N-12) systems.',
      items: [
        { title: 'Superior Hydraulic Efficiency', text: 'Smooth-wall interior PVC and N-12 conduits feature extremely low friction coefficients. Water moves significantly faster through these lines than rough concrete, flushing silt, sand, and organic debris out of your community’s grid before it can settle and clog.' },
        { title: 'Watertight, Root-Proof Joints', text: 'Concrete pipe joints easily separate over time under regional soil shifting, allowing tree roots to penetrate and destroy the line. Our heavy-duty PVC and dual-wall N-12 pipes utilize high-grade engineered gasket connections that resist root intrusion and structural soil movement.' },
        { title: 'Rapid Installation with Minimal Community Disruption', text: 'Heavy RCP requires massive cranes and broad site shut-downs that block HOA roads and parking stalls for weeks. Our targeted rubber-track excavation fleets allow us to install large-diameter commercial lines quickly, safely, and with minimal impact on resident traffic and parking spaces.' },
      ],
    },
    features: {
      eyebrow: 'Our Services',
      heading: 'Commercial & HOA Infrastructure Services',
      intro: 'We handle every component of your property’s exterior water management system:',
      items: [
        { title: 'HOA Common Area & Swale Grading', text: 'Eliminating standing water in community parks, dog runs, and shared green spaces using precision laser transit mapping and heavy-duty turf restructuring.' },
        { title: 'Commercial Parking Lot & Catch Basin Networks', text: 'Installing high-load catch basins, curb inlet connections, and trench channel drains designed to keep parking aprons, garage entrances, and drive lanes completely dry.' },
        { title: 'Retention Pond Outfall & Overflow Pipes', text: 'Replacing failed or crushed corrugated metal outfalls with smooth-wall N-12 or solid PVC lines to keep your storm ponds discharging at legal, engineered capacities.' },
        { title: 'Underground Roof Runoff Mains', text: 'Linking multi-building downspout networks into centralized subterranean storm mains to keep foundation zones bone dry across commercial strips and condo units.' },
        { title: 'Turnkey Site Restoration', text: 'We don’t leave open trenches or ruined grounds. We complete the job with full asphalt patching, concrete curb restoration, and multi-lift soil compaction.' },
      ],
    },
    faqHeading: 'Commercial Property & HOA Management Q&A',
    faqs: [
      { q: 'Why should our HOA choose PVC or N-12 over traditional concrete (RCP) pipe?', a: 'For residential HOAs, commercial strips, and private multi-family sites, dual-wall HDPE (ADS N-12) and solid SDR-35 PVC offer equal or superior load-bearing strength at a fraction of the installation time and cost. Concrete pipe is prone to joint separation and internal erosion in acidic coastal soils. N-12 and PVC feature smooth, chemically inert interiors that maximize water velocity and structural longevity without requiring heavy crane equipment that destroys community roads.' },
      { q: 'How do you handle work around active residents and business traffic?', a: 'We prioritize site safety and property access. We utilize compact, high-flotation rubber-track machinery that leaves minimal turf disturbance, and we stage all work to maintain continuous vehicular access for residents, emergency vehicles, and delivery trucks. Work areas are securely barricaded at the end of every shift.' },
      { q: 'Can you handle both the excavation and the asphalt/concrete repair?', a: 'Yes. That is the core of our one-stop shop commitment. Property managers don’t have to hire a utility contractor to lay the pipe and a separate paving contractor to fix the driveway or curb. We handle the site excavation, pipe installation, aggregate base compaction, and final asphalt/concrete surface restoration in-house.' },
    ],
    cta: {
      heading: 'Ready to solve your HOA or commercial property’s drainage issues?',
      sub: 'Contact us today to schedule a comprehensive site evaluation and commercial project estimate.',
    },
  },
  {
    slug: 'downspout-extensions-1',
    name: 'Downspout Extensions',
    short: 'Commercial-grade, smooth-wall underground downspout systems that carry roof runoff hundreds of feet from your foundation — not just a few inches.',
    icon: 'downspout',
    image: { src: '/img/downspout-extensions.jpg', alt: 'Downspout extended underground into a catch basin to carry roof runoff away from a home' },
    body: [
      'Your roof is the single largest water-collection surface on your entire property. During a typical coastal storm, thousands of gallons of rainwater pour off your shingles in a matter of minutes. If your downspouts simply dump that water right at the base of your foundation or into cheap, flexible plastic tubes, you are actively inviting foundation settlement, crawlspace flooding, and severe yard erosion.',
      'A splash block or standard garden extension only pushes water a few inches away from your walls — allowing it to sink straight down into the loose fill soil around your home. Underground downspout extension networks capture roof water instantly at the gutter line and transport it hundreds of feet away to a safe, legal discharge point.',
      'We engineer commercial-grade, smooth-wall subterranean downspout systems across Southside Virginia and Northeast North Carolina to keep your foundation bone dry and your lawn completely free of standing water.',
    ],
    bullets: ['Buried, solid-pipe extensions', 'Protects foundations, siding & concrete', 'Ties into existing gutters', 'Clean, mulched-over finish'],
    features: {
      heading: 'Key Engineering Features of Our Downspout Networks',
      items: [
        { title: 'Ultra-Thick Smooth-Wall Pipe', text: 'We offer thick, rigid, smooth-wall PVC or HDPE pipe. The glass-smooth interior maximizes water velocity, allowing leaves, silt, and shingle grit to flush completely out of the pipe without stopping.' },
        { title: 'Integrated Cleanout & Leaf Adapter Ports', text: 'We offer custom leaf-diverters or cleanout adapters directly below your gutter transitions. This acts as a primary defense line, preventing large debris from ever getting into your subterranean pipes while giving you an easy access point to flush the lines if needed.' },
        { title: 'Industrial Stainless Steel Hardware', text: 'All cleanouts, transition fittings, and adaptors are mechanically secured using high-grade stainless steel fasteners or glued joints that will never rust, corrode, or rot underground.' },
        { title: 'Dynamic Termination Emitters', text: 'At the discharge point, we install heavy-duty pop-up emitters or curb hole cuts. When the downspout fills with rushing water, the lid pops up to release flow onto your curb. When the flow stops, the lid snaps shut tightly. Our curb hole cuts are perfect 4-inch outlets for our solid pipe.' },
      ],
    },
    faqHeading: 'Subterranean Downspout & Roof Runoff Q&A',
    faqs: [
      { q: 'How far away from my home’s foundation should downspouts discharge?', a: 'At an absolute minimum, roof water should be discharged at least 10 to 15 feet away from your foundation walls. Our standard is a 30-foot minimum. Dumping water any closer allows it to soak directly into the loosened backfill soil surrounding your foundation footings, creating intense hydrostatic pressure that leads to cracked masonry, flooded crawlspaces, and basement leaks. For properties with severe clay or flat elevation, we often extend lines 20 to 50+ feet to reach natural slope drops or street swales.' },
      { q: 'Can underground downspout lines freeze or burst during winter?', a: 'When installed correctly with positive downhill slope, smooth-wall PVC lines will not burst because water continuously drains out via gravity rather than sitting trapped in the pipe.' },
      { q: 'Can you tie my downspouts directly into my French drain system?', a: 'No, and no reputable drainage engineer will ever do this. Roof downspouts collect massive volumes of water along with roof shingle grit, twigs, and organic debris. If you tie a downspout directly into a perforated French drain line, you will rapidly flood the French drain with surface debris, clogging the gravel envelope and forcing dirty roof water into your groundwater grid. Downspout lines must always remain solid, non-perforated conduits kept completely separate from subterranean groundwater collection networks.' },
    ],
    cta: {
      heading: 'Stop losing your landscaping to roof runoff',
      sub: 'Is overflowing roof water washing away your landscaping or flooding your foundation? Don’t settle for collapsing corrugated tubes — contact us today to schedule an on-site evaluation and get a permanent, commercial-grade downspout network installed.',
    },
  },
  {
    slug: 'concrete-drains-1',
    name: 'Concrete Drains',
    short: 'Continuous concrete channel drains and heavy-duty surface interceptor grates that catch sheet-flow across driveways, patios and parking lots before it reaches your structures.',
    icon: 'trench',
    image: { src: '/img/concrete-drains.jpg', alt: 'Concrete channel drain with metal grate installed along a garage driveway' },
    body: [
      'When massive rainstorms or flash flooding hit wide concrete surfaces — like driveways, patio decks, commercial loading bays, and parking aprons — gravity causes water to rapidly sheet across the smooth stone. Left unchecked, this rushing surface water slams into garage doors, floods low-lying entryways, pools against foundation slabs, and washes out adjacent turf.',
      'Traditional lawn drains or small catch basins cannot keep up with high-velocity sheet-flow. Protecting large hardscape footprints requires continuous concrete channel drains and heavy-duty surface interceptor grates built to catch water across the entire width of a paved span before it reaches your structures.',
      'We design and install commercial-grade surface interception networks across Southside Virginia and Northeast North Carolina, utilizing reinforced concrete trench channels, high-load cast iron or stainless grates, and smooth PVC storm mains engineered to handle extreme storm events.',
    ],
    bullets: ['Channel & trench drain installation', 'Ties into full-property drainage', 'Clean concrete cuts and finishing', 'Grates rated for foot & vehicle traffic'],
    challenges: {
      eyebrow: 'Applications',
      heading: 'Critical Applications for Surface Interception Networks',
      intro: 'Installing engineered trench drainage solves specific hardscape water issues that standard grading alone cannot fix:',
      items: [
        { title: 'Driveway Slopes & Garage Entryways', text: 'Driveways that pitch downward toward a garage or home create an immediate flood hazard. A heavy-duty channel drain cut directly across the driveway in front of the garage door acts as a structural barrier, catching 100% of the downhill runoff before it breaches the threshold.' },
        { title: 'Pool Decks & Patio Enclosures', text: 'Flat concrete pool surrounds and hardscape patios frequently trap water against home foundations or back up into pool water during torrential downpours. Slotted channel drains installed flush with the concrete flush away deck water while keeping deck surfaces slip-free.' },
        { title: 'Retaining Wall Bases & Walkway Traps', text: 'Retaining walls and concrete walkways can act like dams, trapping surface water behind them. Interceptor channels collect this trapped water instantly, relieving hydraulic pressure and preventing structural cracking.' },
        { title: 'Commercial Parking & Loading Bays', text: 'Heavy equipment and vehicles require high-load-class trench systems (Class C or D) that can withstand thousands of pounds of wheel pressure while rapidly draining massive paved footprints.' },
      ],
    },
    features: {
      eyebrow: 'Construction Standards',
      heading: 'Commercial-Grade Construction Standards',
      intro: 'A channel drain is only as durable as its channel encasement and grating material. We construct surface drainage networks using rigid civil engineering specifications:',
      items: [
        { title: 'Reinforced Concrete Encasement', text: 'We set our channels inside a dedicated concrete pour. Encasing the channel in high-strength concrete prevents the trench walls from flexing, cracking, or bowing inward when heavy trucks or vehicles drive over the line.' },
        { title: 'High-Load Grating Options', text: 'Depending on traffic requirements, we install corrosion-resistant cast iron, ductile iron, or heavy-gauge stainless steel grates. For coastal areas exposed to salt spray or pool chemicals, rustproof stainless steel or high-density polymer grates ensure decades of zero maintenance.' },
        { title: 'Sloped Sub-Trench Channels', text: 'To keep water moving continuously and prevent standing puddle smells or mosquito breeding, we utilize pre-sloped channels that force water downhill toward the discharge pipe even on flat ground.' },
        { title: 'Integrated Inline Cleanout Baskets', text: 'Every channel system includes accessible catch basins with removable sediment baskets. This catches sand, lawn debris, and gravel before it can enter your main subterranean drainage pipes.' },
      ],
    },
    faqHeading: 'Concrete & Channel Drain Q&A',
    faqs: [
      { q: 'Can a channel drain be retrofitted into an existing concrete driveway or patio?', a: 'Yes. We frequently install channel drains in existing concrete. We use diamond-blade concrete saws to cut a precise trench through the existing slab, excavate the underlying base, install the channel grid with solid PVC discharge piping, and pour a fresh concrete collar around the new trench so it ties seamlessly into your existing hardscape.' },
      { q: 'What load rating do I need for a driveway channel drain?', a: 'For standard residential driveways where cars, SUVs, and light trucks drive over the grate, a Class B (up to 174 psi / 27,500 lbs) load-rated grate is ideal. If your driveway experiences heavy commercial traffic, delivery trucks, or large RVs, we step up to Class C or Class D heavy-duty ductile iron grates to ensure zero bending or structural cracking under weight.' },
      { q: 'How do you keep leaves and dirt from clogging a long channel drain?', a: 'Our trench systems utilize slotted or decorative grates designed to block large leaves and twigs while allowing water to drop through. Inside the channel end-cap or inline junction box, an integrated sediment trap basket captures fine debris. You simply lift off the grate section once or twice a year and dump out the basket to keep the system flowing at peak capacity.' },
    ],
    cta: {
      heading: 'Stop sheet-flow from damaging your hardscape',
      sub: 'Is surface water flooding your garage, pooling on your patio, or washing across your driveway? Don’t let unchecked sheet-flow damage your hardscape investment. Contact us today to schedule an on-site laser grade assessment and trench drain consultation.',
    },
  },
  {
    slug: 'grading-services',
    name: 'Grading Services',
    short: 'Commercial-grade earth-moving and precision leveling that permanently corrects pitch issues so heavy coastal runoff flows safely away from your property.',
    icon: 'grade',
    image: { src: '/img/grading-services.jpg', alt: 'Freshly graded and leveled backyard ready for sod, pitched to carry water away from the home' },
    body: [
      'If your lawn has uneven ruts, a bumpy terrain, or slopes that direct rainwater straight toward your home’s foundation, standard landscaping fixes won’t solve the problem. Proper yard grading and precision leveling form the literal foundation of all successful stormwater management.',
      'We provide commercial-grade earth-moving, land leveling, and structural re-grading services designed to permanently correct pitch issues, stabilize your topsoil, and guarantee that heavy coastal runoff flows safely away from your investment.',
    ],
    bullets: ['Corrects negative slope toward the home', 'Often paired with French drains', 'Restores lawn after grading', 'Prevents erosion and pooling'],
    sectionOrder: ['subServices', 'challenges', 'features', 'faqs', 'process', 'areaList'],
    subServices: {
      eyebrow: 'Our Services',
      heading: 'Our Chesapeake Grading & Land Leveling Services',
      items: [
        { title: '1. Yard Regrading & Slope Correction', intro: 'We correct negative slopes and uneven terrain to promote proper drainage away from your home. Our drainage grading services ensure effective water management and erosion control around your property.' },
        { title: '2. Land Leveling & Soil Reshaping', intro: 'From filling depressions to cutting down high spots, we create a clean, even-grade surface ready for any landscaping or construction project. Our land leveling services help ensure your project starts on the right foot.' },
        {
          title: '3. Drainage-Integrated Grading',
          intro: 'Hampton Roads’ clayey soil holds water longer, so we blend grading with engineered drainage options such as:',
          bullets: ['French drains', 'Downspout extensions', 'Sump pump systems', 'Swales', 'Surface drains'],
          outro: 'This creates a complete solution, not just a temporary fix for your drainage needs.',
        },
        { title: '4. Rough & Finish Grading for New Builds', intro: 'We work with homeowners, builders, and contractors across the seven cities to perform both initial grading and final precision grading for lawns and landscaping.' },
        { title: '5. Erosion Control & Stabilization', intro: 'We address soil movement caused by rain or slope issues, providing effective erosion control. We install proper soil or groundcover solutions where needed to stabilize your landscape.' },
      ],
    },
    challenges: {
      eyebrow: 'Grading vs. Leveling',
      heading: 'The Critical Difference Between "Leveling" and "Grading"',
      intro: 'Many property owners use these terms interchangeably, but they serve completely different, vital roles in protecting your property:',
      items: [
        { title: 'Rough & Final Grading (Water Direction)', text: 'This process reshapes the slope of your land. The goal isn’t to make the ground perfectly flat; it’s to create a calculated, intentional pitch (ideally a 1% minimum drop away from foundation walls) so gravity can safely shed water toward natural drainage ditches, swales, or municipal storm mains.' },
        { title: 'Precision Leveling (Surface Uniformity)', text: 'Once the correct slope is structurally established, leveling smooths out the surface. We eliminate dangerous holes, ankle-twisting ruts, and low depressions where standing water would otherwise pool and oversaturate your lawn’s root systems.' },
      ],
    },
    features: {
      eyebrow: 'Coastal Soil',
      heading: 'Why Coastal Soil Dynamics Demand Engineered Grading',
      items: [
        { title: 'Foundation Hydrostatic Pressure', text: 'In flat, low-lying coastal cities like Virginia Beach, Norfolk, Portsmouth, and Hampton, there is very little natural elevation to help water move. A negative grade (sloping back toward the house) forces water against your foundation walls or crawlspace vents, causing structural bowing, rot, and severe mold.' },
        { title: 'The Flat Clay Pan Effect', text: 'In Chesapeake and Suffolk, heavy clay soils don’t absorb water quickly. Without a perfectly calculated positive grade to shed sheet-flow water horizontally across the turf, rainwater simply sits on top of the clay, creating permanent marsh zones in your yard.' },
        { title: 'New Construction Alterations', text: 'In rapidly growing areas like Moyock, Carrollton, Smithfield, and Currituck County, clear-cutting trees and adding massive roofs or driveways completely changes how water behaves. We execute precise grading to ensure your new structures or large lots don’t shed destructive runoff onto your own property — or your neighbors’.' },
      ],
    },
    faqHeading: 'Frequently Asked Grading Questions',
    faqs: [
      { q: 'How much does yard grading cost?', a: 'Most residential grading projects, including our drainage grading services, range from $1,000–$6,500, depending on soil conditions, yard size, and the amount of earthmoving required.' },
      { q: 'Do you handle grading for new construction?', a: 'Yes — we provide rough and final grading for new builds throughout Chesapeake, including land leveling Chesapeake services to ensure your property is perfectly graded.' },
      { q: 'Can you fix drainage problems from poor grading?', a: 'Absolutely. We specialize in correcting negative slope, pooling water, and soggy areas caused by improper grading, including effective erosion control solutions.' },
      { q: 'How long does the process take?', a: 'Most grading projects are completed in 1–3 days, depending on scope and weather.' },
    ],
    process: {
      heading: 'Our Laser-Guided Grading & Leveling Process',
      intro: 'We don’t eyeball slopes or guess pitches. We utilize commercial grade mini skid steers, compact excavators and advanced laser-transit leveling equipment to move dirt with surgical precision.',
      items: [
        { title: 'Laser-Transit Topographic Mapping: Site Audit', text: 'We utilize precision laser levels to shoot elevations across your property, locating the exact high points, low points, and structural obstacles to plan a flawless exit route for surface water.' },
        { title: 'Rough Grading & Cut-and-Fill: Earth Moving', text: 'Using specialized turf-friendly machinery, we mechanically cut down high ridges and fill in deep depressions, structurally re-sculpting the sub-base dirt to establish a permanent positive slope away from all structures.' },
        { title: 'Topsoil Conditioning & Tilling: Soil Preparation', text: 'We scarify and break up compacted clay layers with specialized machinery, and upon request can import premium organic topsoil or sand blends tailored to your specific regional soil needs, ensuring a healthy foundation for new turf growth.' },
        { title: 'Final Precision Leveling & Smoothing: The Clean Finish', text: 'Using specialized leveling rakes and commercial soil conditioners, we smooth the surface to a clean, uniform finish, completely eliminating all minor ruts, bumps, and localized micro-depressions.' },
        { title: 'Stabilization & Seed Prep: Erosion Shielding', text: 'To protect your newly engineered slopes from washing away during the next heavy coastal storm, we compact the soil to optimal densities and prepare it for immediate sod installation or hydroseeding.' },
      ],
    },
    areaList: {
      heading: 'Serving the Entire Hampton Roads & NE North Carolina Region',
      intro: 'Commercial-grade grading and leveling across the Tidewater and northeastern North Carolina corridor.',
      areas: ['Virginia Beach', 'Chesapeake', 'Suffolk', 'Norfolk', 'Portsmouth', 'Smithfield', 'Carrollton', 'Hampton', 'Yorktown', 'Moyock', 'Currituck County', 'Camden County'],
    },
    cta: {
      heading: 'Take control of your land',
      sub: 'Don’t wait for a heavy seasonal downpour or a coastal Nor’easter to prove your yard’s slope is working against your home. Contact us today to schedule an expert on-site laser topographic assessment.',
    },
  },
  {
    slug: 'outdoor-sump-pumps-1',
    name: 'Outdoor Sump Pumps',
    short: 'Commercial-grade outdoor sump pump systems that mechanically lift rising groundwater off flat, low-lying coastal properties where gravity alone can’t drain.',
    icon: 'pump',
    image: { src: '/img/outdoor-sump-pumps.jpg', alt: 'Outdoor sump pump discharge basin installed beside a home entrance' },
    body: [
      'When dealing with a naturally high water table, flat coastal topography, or a low-lying property that sits lower than the surrounding municipal drainage lines, gravity alone isn’t always enough to protect your yard and foundation. When water has nowhere else to go, a heavy-duty outdoor sump pump system is the ultimate, engineered line of defense.',
      'Unlike standard indoor basement pumps, an outdoor crawlspace or yard sump pump system is designed to intercept massive volumes of rising groundwater and surface sheet-flow, mechanically lifting it and forcing it completely off your property to a safe, legal discharge point.',
      'We construct commercial-grade, subsurface outdoor basin and pumping stations built specifically to withstand the extreme environmental pressures and soil dynamics of the Hampton Roads and Northeast North Carolina coastlines.',
    ],
    bullets: ['For low or flat yards gravity can’t drain', 'Sized for worst-case rainfall', 'Buried basin, discreet discharge line'],
    process: {
      heading: 'The Anatomy of an Engineered Outdoor Pumping Station',
      items: [
        { title: 'Subsurface Infiltration Basin Excavation', text: 'We excavate a deep structural pit at the lowest logical convergence point of your drainage network. We install a heavy-walled, perforated or solid dual wall polyethylene basin wrap-encapsulated in #57 drainage stone and non-woven geotextile fabric. This creates a massive subsurface collection reservoir that relieves the surrounding soil’s hydrostatic pressure (when required).' },
        { title: 'Cast-Iron Commercial Pump Integration', text: 'We install premium, continuous-duty Zoeller cast-iron submersible pumps (featuring stainless steel hardware and non-clogging vortex impellers). These pumps easily handle heavy solids up to 1/2" and pump thousands of gallons per hour without overheating. We only use the highest quality outdoor rated pumps complete with a manufacturer’s warranty.' },
        { title: 'Rigid Discharge Piping & Backflow Prevention', text: 'The pump is plumbed using heavy-wall 1-1/2" schedule 40 solid PVC. We install specialized inline check valves to prevent pumped water from draining backward into the pit when the pump cycles off, maximizing mechanical efficiency of the system.' },
        { title: 'High Quality Design', text: 'We don’t use cheap, retail-grade plastics or standard exterior screws that corrode and snap over time. Every sump basin we build utilizes heavy-duty, septic-grade components designed to withstand constant moisture and severe underground soil pressures. To guarantee absolute structural longevity in our high-salinity coastal environments, we lock everything together using industrial-grade stainless steel fasteners that will never rust, degrade, or fail under pressure. When we bury a system on your property, it is engineered to stay locked, clear, and fully operational for decades.' },
      ],
    },
    faqHeading: 'Outdoor Sump Pump & Groundwater Engineering Q&A',
    faqs: [
      { q: 'Why can’t I just rely on a standard drain without a pump?', a: 'Traditional drains are a gravity-fed highway. For a gravity drain to work, the discharge end must be lower than the collection end. In flat or low-lying coastal cities like Virginia Beach, Norfolk, and Portsmouth, or low points in Chesapeake, there is often zero natural elevation change. If your yard sits lower than the roadside ditch or the municipal storm main, a gravity drain will simply fill up with water and back up. An outdoor sump pump acts as a mechanical elevator — it collects the gravity-fed water in a deep subterranean basin and physically lifts it up and out, creating an artificial slope where nature didn’t provide one.' },
      { q: 'Will an outdoor pump basin float or pop out of the ground when the soil saturates?', a: 'Yes, if it is installed incorrectly. This is a massive issue in regions with high water tables and dense clay soils like Suffolk and Moyock. A hollow plastic basin buried in water-logged soil acts exactly like a boat hull — hydrostatic pressure will literally pop the entire basin out of the ground, destroying your pipes and landscaping. We take special care to ensure this will never happen to your sump pump basin by designing the basin specifically for your property and your exact soil type.' },
    ],
    areaList: {
      heading: 'Custom Engineered for Regional Soil Conditions',
      intro: 'From handling the fine sand infiltration common in Currituck and Virginia Beach to managing the sluggish, high-friction water movement through the clay layers of Smithfield and Carrollton, we tailor every basin to match the exact earth mechanics of your property.',
      areas: ['Virginia Beach', 'Chesapeake', 'Suffolk', 'Norfolk', 'Portsmouth', 'Smithfield', 'Carrollton', 'Hampton', 'Yorktown', 'Moyock', 'Currituck County', 'Camden County'],
    },
    cta: {
      heading: 'Don’t let a rising water table dictate your property',
      sub: 'Keep your yard dry and your crawlspace secure with a heavy-duty mechanical drainage system. Contact us today to schedule a comprehensive on-site laser grade and subsurface water table evaluation.',
    },
  },
  {
    slug: 'exterior-waterproofing',
    name: 'Exterior Waterproofing',
    short: 'Commercial-grade exterior waterproofing — a multi-layer membrane, drainage mat and footing drain system that stops groundwater before it ever reaches your foundation walls.',
    icon: 'shield',
    image: { src: '/img/exterior-waterproofing.jpg', alt: 'Excavation along a home foundation wall to install an exterior waterproofing and footing drain system' },
    body: [
      'When groundwater saturates the soil surrounding your home, it exerts a relentless physical force known as hydrostatic pressure. This pressure pushes thousands of gallons of water directly against your below-grade foundation walls. If your home relies on simple interior fixes like paints or French drains inside the crawlspace, you are merely managing water after it has already breached your home’s structure.',
      'True structural protection requires exterior waterproofing — the only permanent method that stops water from ever touching your foundation in the first place. We design and install commercial-grade exterior waterproofing systems that intercept groundwater, shield your foundation walls, and route moisture safely away from your structure.',
    ],
    bullets: ['Below-grade sealing & membranes', 'Paired with French drain systems', 'Reduces basement & crawlspace moisture', 'Protects foundation walls long-term'],
    challenges: {
      heading: 'Why Foundations Leak and Rot in the Tidewater Region',
      intro: 'Our local geography presents a combination of environmental pressures that can rapidly break down standard residential foundation coatings:',
      items: [
        { title: 'Continuous Hydrostatic Pressure', text: 'In flat, low-lying coastal cities like Virginia Beach, Norfolk, Portsmouth, and Hampton, a naturally high water table means the soil surrounding your crawlspace block or basement is permanently water-logged. Without an exterior barrier, water will seep right through porous concrete blocks and mortar joints.' },
        { title: 'The Clay Bathtub Effect', text: 'In Chesapeake and Suffolk, dense clay soils trap water right next to your foundation. When your home was built, the dirt excavated around the foundation was loosened. Rainwater naturally fills this loose backfill zone first, creating an underground "bathtub" of water trapped against your walls by the surrounding unexcavated clay.' },
        { title: 'Corrosive Coastal Soils', text: 'In rapid growth areas like Moyock, Carrollton, and Currituck County, high soil acidity and shifting water tables accelerate the breakdown of cheap, builder-grade "dampproofing" tar, leaving your foundation exposed to water intrusion within just a few years.' },
      ],
    },
    process: {
      heading: 'Engineered Multi-Layer Foundation Drain Process',
      intro: 'We don’t just spray a thin coat of black paint and call it waterproofed. We follow a strict commercial-grade protocol to create an impenetrable, multi-layer envelope around your structure.',
      items: [
        { title: 'Excavation & Wall Preparation', text: 'We carefully excavate the earth down to your concrete footings, exposing the entire subsurface foundation wall. The wall is mechanically cleaned, power-washed, and inspected for hidden structural cracks or missing mortar joints.' },
        { title: 'Hydraulic Cement Parging (Basement/Crawlspace Only)', text: 'Every structural crack, tie hole, and failing mortar joint is deeply chiseled out and packed tight with high-strength hydraulic cement to structurally seal the masonry surface.' },
        { title: 'Dimpled Drainage Mat', text: 'We hang a heavy-duty dimpled poly-matrix drainage mat over the membrane. The dimples create a permanent structural air gap, instantly relieving hydrostatic pressure by letting water drop straight down to the base of the wall instead of pushing inward.' },
        { title: 'Footing Drain Installation & Encapsulation', text: 'At the base of the wall, we lay an engineered footing pipe wrapped in washed #57 drainage stone and premium non-woven geotextile fabric. This collection highway catches the falling water and routes it safely to a gravity outlet or an outdoor sump pump station.' },
      ],
    },
    faqHeading: 'Foundation Waterproofing & Soil Mechanics Q&A',
    faqs: [
      { q: 'What is the difference between "dampproofing" and "waterproofing"?', a: 'Dampproofing is a cheap, thin asphalt spray applied to almost all new homes during construction to meet bare-minimum building codes. It is designed only to resist incidental soil vapor — not hydrostatic water pressure. Over a few years, it dries out, becomes brittle, and decomposes. True exterior waterproofing involves a thick, elastomeric rubber membrane combined with structural drainage mats that can actively span concrete cracks, resist constant standing water pressure, and flex with the home without tearing.' },
      { q: 'Why do you use septic-grade components and stainless steel fasteners?', a: 'The environment beneath your lawn is highly corrosive, especially with the brackish groundwater and high soil-salinity levels found throughout the Hampton Roads and Northeast North Carolina corridors. Standard exterior screws and cheap, retail-grade PVC basins quickly degrade, rust, or crack under underground earth pressures. We build our systems out of heavy-duty, septic-grade components designed to handle permanent subterranean stress, and lock our protection boards and fittings in place with industrial-grade stainless steel fasteners that will never rust or fail.' },
      { q: 'Can I just fix my wet crawlspace or basement from the inside?', a: 'While interior drainage systems (like interior French drains and sump pumps) are excellent at catching water after it gets inside, they do not stop the water from migrating through your foundation walls. When water passes through concrete block, it causes a chemical breakdown called efflorescence, slowly dissolving the lime and mortar that holds your foundation together. Exterior waterproofing stops the water on the outside of the house, keeping your foundation walls dry, stable, and structurally sound for the life of the property.' },
    ],
    areaList: {
      heading: 'Serving the Entire Hampton Roads & NE North Carolina Region',
      intro: 'Whether you are looking to protect a historic brick foundation in Norfolk or Portsmouth, solve a heavy clay water issue in Chesapeake or Suffolk, or secure a new build along the coastal corridors of Virginia Beach, Moyock, or Camden, we custom-engineer every project to perfectly match your local water table dynamics.',
      areas: ['Virginia Beach', 'Chesapeake', 'Suffolk', 'Norfolk', 'Portsmouth', 'Smithfield', 'Carrollton', 'Hampton', 'Yorktown', 'Moyock', 'Currituck County', 'Camden County'],
    },
    cta: {
      heading: 'Stop fighting a losing battle against groundwater',
      sub: 'Don’t let hydrostatic pressure slowly compromise your home’s structural integrity. Contact us today to schedule an expert on-site foundation inspection and drainage audit.',
    },
  },
  {
    slug: 'culvert-pipe-installation-1',
    name: 'Culvert Pipe Installation',
    short: 'Commercial-grade culvert pipe installation and structural re-engineering built to handle heavy coastal runoff and withstand heavy vehicle traffic for decades.',
    icon: 'pipe',
    image: { src: '/img/culvert-pipe-installation.jpg', alt: 'Newly installed culvert pipe with rip-rap stone at a driveway entrance' },
    body: [
      'A properly installed driveway culvert is the single most critical element of your property’s exterior drainage system. In rural, suburban, and rapidly growing coastal communities, roadside ditches and swales act as the municipal highway for stormwater.',
      'If your driveway crossing has a collapsed, undersized, or improperly pitched pipe, it acts like a dam — backing up thousands of gallons of water, flooding your front yard, eroding your driveway, and potentially creating severe legal and structural liabilities.',
      'We provide commercial-grade culvert pipe installation, replacement, and structural re-engineering designed to handle heavy coastal runoff and withstand heavy vehicle traffic for decades.',
    ],
    bullets: ['Sized to handle ditch & storm flow', 'Permits researched and obtained', 'Prevents driveway washouts', 'Durable, code-compliant pipe'],
    sectionOrder: ['challenges', 'features', 'process', 'note', 'areaList'],
    challenges: {
      heading: 'Why Culvert Installations Fail in Our Coastal Districts',
      intro: 'Culvert installation requires exact engineering. Because of our unique local geography and high water tables, simple DIY approaches or cut-corner installations fail rapidly due to three primary regional factors:',
      items: [
        { title: 'Improper Pipe Sizing (The Bottleneck Effect)', text: 'In expanding rural-suburban corridors like Chesapeake, Suffolk, and Currituck County, regional storm volumes can increase dramatically as new homes are built up the road. Installing an undersized pipe causes immediate upstream pooling and dangerous localized flooding during heavy storms.' },
        { title: 'Saturated Soil Settling & Crushing', text: 'In low-lying, soft-soil areas like Virginia Beach, Norfolk, Portsmouth, and parts of Camden County, cheap thin-walled plastic pipes easily deform and bow under the weight of heavy delivery trucks or construction equipment if they lack a properly compacted aggregate foundation.' },
        { title: 'Erosion and "Scouring" at the Ends', text: 'Without concrete headwalls, rip-rap stone reinforcement, or proper soil stabilization, rushing water will slowly scour out the dirt around the pipe’s mouth. This creates hollow cavities beneath your driveway that eventually lead to a catastrophic cave-in.' },
      ],
    },
    features: {
      eyebrow: 'Materials',
      heading: 'Commercial-Grade Materials Built for Heavy Loads',
      intro: 'We do not use flimsy, single-wall residential pipes that warp or split over time. We install long-lasting, heavy-duty drainage materials specified to meet local municipal standards and handle heavy-axle vehicle traffic:',
      items: [
        { title: 'Dual-Wall High-Density Polyethylene (HDPE)', text: 'These pipes feature a corrugated exterior shell for massive structural load-bearing strength and a smooth interior lining that maximizes water velocity, preventing silt and debris from settling and clogging the line.' },
        { title: 'Reinforced Concrete Pipe (RCP)', text: 'The ultimate permanent standard for heavy commercial crossings, large-scale rural ditches, and areas requiring minimal soil cover over the pipe.' },
      ],
    },
    process: {
      heading: 'Our Laser-Guided Culvert Installation Process',
      intro: 'Every culvert crossing we build follows a strict structural blueprint to guarantee it maintains perfect flow alignment and never shifts under heavy pressure.',
      items: [
        { title: 'Laser-Transit Grade Setting', text: 'We calculate the exact upstream and downstream elevations of your roadside ditch using laser transits. We ensure the new pipe perfectly matches the natural flow line of the channel so water never idles or backs up.' },
        { title: 'Ditch Clearing & Trenching: Excavation', text: 'We excavate the existing failed pipe, clearing out accumulated silt, invasive roots, and collapsed dirt to completely restore the original design width of the water channel.' },
        { title: 'Crushed Stone Aggregates: Foundational Bedding', text: 'We lay a foundational bedding of washed #57 drainage stone or dense-grade aggregate. This solid bed prevents the pipe from settling unevenly over time and shifting out of pitch.' },
        { title: 'Pipe Placement & Mechanical Fitting: Setting the Line', text: 'The heavy-duty culvert pipe is mechanically set onto the stone bed. We double-check the downward pitch with digital levels before locking it into its permanent position.' },
        { title: 'Lifts of Compacted Aggregate Backfill: Structural Integrity', text: 'We backfill around the sides and top of the pipe in tight, 6-inch layers ("lifts"). Each lift is mechanically compacted with heavy tamping equipment to create a bridge that absorbs vehicle wheel loads.' },
        { title: 'Erosion Control & Headwall Armor: Flank Protection', text: 'To prevent future scouring, we secure both ends of the culvert with heavy rip-rap stone stabilization to permanently lock the soil in place.' },
      ],
    },
    note: {
      eyebrow: 'Permits & Codes',
      heading: 'Navigating Municipal Codes & Drainage Permits',
      text: 'Installing a driveway culvert isn’t just about moving dirt — it frequently requires navigating strict municipal guidelines, utility location clearances, and right-of-way permitting. Whether you are dealing with VDOT requirements in Hampton, Yorktown, and Smithfield, city engineering specs in Chesapeake and Suffolk, or county drainage board codes down in Moyock and Currituck, we ensure your installation meets or exceeds all local structural codes.',
    },
    areaList: {
      heading: 'Serving All Local Districts & Crossings',
      areas: ['Virginia Beach', 'Chesapeake', 'Suffolk', 'Norfolk', 'Portsmouth', 'Smithfield', 'Carrollton', 'Hampton', 'Yorktown', 'Moyock', 'Currituck County', 'Camden County'],
    },
    cta: {
      heading: 'Is a failing culvert pipe threatening your driveway?',
      sub: 'Don’t wait for the city to issue a citation or for the next coastal storm to wash out your access point. Contact us today to schedule an expert on-site structural evaluation and laser grade audit.',
    },
  },
  {
    slug: 'gravel-driveways',
    name: 'Gravel Driveways',
    short: 'Commercial-grade gravel driveway construction with multi-layer stone bases, laser-guided slopes and heavy compaction so your driveway stays solid instead of rutting or washing out.',
    icon: 'gravel',
    image: { src: '/img/gravel-driveways.jpg', alt: 'Finished gravel driveway winding through wooded property' },
    body: [
      'A beautiful, functional gravel driveway is an excellent, cost-effective alternative to concrete or asphalt — but it requires far more than just dumping stone on top of bare dirt. Without proper engineering, a gravel driveway will quickly develop deep ruts, wash away during heavy coastal storms, and turn into a muddy swamp.',
      'We provide commercial-grade gravel driveway construction, structural re-grading, and stone resurfacing services throughout the Hampton Roads and Northeast North Carolina corridors. We build our driveways with correct multi-layer stone bases, precise laser-guided slopes, and heavy compaction so your driveway stays solid, smooth, and clear for decades.',
    ],
    bullets: ['Proper base & grading', 'Sheds water instead of pooling', 'Durable in Hampton Roads clay soil', 'Can be paired with drainage work'],
    challenges: {
      heading: 'Why Driveways Wash Out and Rut in Our Region',
      intro: 'Building a gravel driveway that lasts requires a deep understanding of local coastal soil dynamics and heavy storm runoff:',
      items: [
        { title: 'The Mud-Mix Effect', text: 'In Chesapeake, Suffolk, and parts of Moyock, the native soil is packed with heavy clay. If you dump clean gravel directly onto clay dirt without a stabilizing barrier, heavy vehicles will push the gravel down into the mud while forcing the clay up, swallowing your investment within a few seasons.' },
        { title: 'Sheet-Wash Erosion', text: 'Flat, low-lying coastal lots in Virginia Beach, Norfolk, and Currituck County face massive volumes of sheet-flow rainwater during heavy downpours or seasonal Nor’easters. If a driveway lacks a crowned center or an adjacent bar-ditch, rushing surface water will strip the top stone right off your property.' },
        { title: 'Pothole Proliferation', text: 'Potholes aren’t just surface holes — they are structural failures caused by standing water soaking into the sub-base dirt. Once the underlying soil softens, every passing vehicle wheel pumps the sub-grade out, creating a permanent structural pocket that will collapse again and again if it isn’t properly excavated and re-engineered.' },
      ],
    },
    faqHeading: 'Gravel Driveway Engineering & Performance Q&A',
    faqs: [
      { q: 'Why is my gravel driveway disappearing into the ground?', a: 'This is a classic issue known as the "mud-mix effect," and it’s incredibly common in heavy clay soils like those in Chesapeake and Suffolk, as well as sandy coastal areas. When heavy vehicles drive over gravel placed directly on top of bare dirt, it pushes the rocks down into the soil while forcing mud up to the surface. We prevent this permanently by installing a commercial-grade woven geotextile stabilization fabric between the raw earth and your first layer of stone. It acts as a permanent barrier that keeps your gravel on top where it belongs.' },
      { q: 'Why do potholes keep coming back in the exact same spots?', a: 'A pothole isn’t just a surface issue; it’s a structural failure underneath. When rainwater pools on a flat driveway, it saturates the sub-base dirt. Every time a car tire drives over that wet spot, it pumps the underlying dirt out from under the gravel, creating a hollow pocket. If you just throw loose gravel into a pothole, it will cave right back in within a few weeks. The right way to fix it is to mechanically excavate the failure zone, establish a proper downward pitch, compact the sub-grade, and re-sculpt a center crown so water sheds off the driveway instantly instead of pooling.' },
      { q: 'What is the best type of stone for a long-lasting driveway?', a: 'For a high-traffic, durable driveway, Crusher Run is usually the best option for the wear surface. It contains a calculated mix of crushed stone and fine stone dust. When moistened and compacted with a commercial heavy roller, the dust locks the stones together, packing down into a dense, solid crust that minimizes shifting and naturally deters weed growth. If you prefer a clean-stone look without the dust, sharp-edged angular aggregates like #57 Stone or crushed granite are excellent because they lock together tightly when compressed, unlike smooth, rounded river rocks which tend to shift and roll under heavy tires.' },
    ],
    areaList: {
      heading: 'Serving the Entire Tidewater & Northeast NC Footprint',
      intro: 'Whether you need a brand-new driveway cut through a rural parcel in Smithfield, Yorktown, or Camden County, or a long suburban lane re-graded and resurfaced in Chesapeake, Suffolk, or Virginia Beach, we bring the right machinery and technical expertise to handle the job correctly.',
      areas: ['Virginia Beach', 'Chesapeake', 'Suffolk', 'Norfolk', 'Portsmouth', 'Smithfield', 'Carrollton', 'Hampton', 'Yorktown', 'Moyock', 'Currituck County', 'Camden County'],
    },
    cta: {
      heading: 'Is your driveway turning into a muddy marsh?',
      sub: 'Don’t waste money throwing loose stone into failing potholes. Contact us today to schedule a comprehensive on-site laser grade assessment and driveway consultation.',
    },
  },
  {
    slug: 'trenching-service',
    name: 'Trenching Service',
    short: 'Professional mechanical utility trenching for electrical, water, gas and fiber lines — engineered to municipal depth codes with minimal disruption to your property.',
    icon: 'dig',
    image: { src: '/img/trenching-service.jpg', alt: 'Utility trench with conduit laid along a backyard, ready for backfill' },
    body: [
      'Whether you are an electrical contractor running heavy commercial conduit, a plumber laying a main water line, or a homeowner extending power to a detached garage, cutting a clean trench requires the right machinery, exact depth calibration, and structural precision.',
      'We provide professional, mechanical utility trenching services engineered to meet strict municipal depth codes while minimizing disruption to the surrounding property. We operate as both a specialized subcontractor for local trades and a direct service provider for residential and agricultural property upgrades throughout Chesapeake, Virginia Beach, Norfolk, Suffolk, Portsmouth, Hampton, and Newport News.',
    ],
    bullets: ['811 utility locates called first', 'Dug to your specified depth & width', 'Backfilled and surface restored', 'For drainage, irrigation & utility lines'],
    challenges: {
      eyebrow: 'Utility Types',
      heading: 'High-Performance Trenching for All Utility Frameworks',
      intro: 'We cut trenches designed to match the exact structural specs and depth requirements of your specific project:',
      items: [
        { title: 'Electrical & Gas Conduits', text: 'Clean, deep runs matching national and local code requirements for secondary electrical feeds, standby generator line ties, and propane or natural gas piping.' },
        { title: 'Water Lines & Plumbing Mains', text: 'Precise excavation below the local frost line to safeguard main water services, irrigation mainlines, and sub-surface sewer force mains.' },
        { title: 'Low-Voltage & Fiber Networks', text: 'Micro-trenching lines for high-speed fiber internet, outdoor security systems, landscape lighting grids, and data boundaries.' },
      ],
    },
    features: {
      eyebrow: 'Soil Conditions',
      heading: 'Navigating the Challenges of Coastal Subsurface Earth',
      intro: 'Excavating underground lines in our regional footprint involves navigating highly volatile soil profiles that can collapse or flood if handled improperly:',
      items: [
        { title: 'The Flat Clay Matrix', text: 'In Chesapeake, Suffolk, and Moyock, heavy, dense clay resists standard digging and holds massive amounts of moisture. Our heavy-duty track equipment cuts through compacted clay without tearing up vast sections of turf.' },
        { title: 'High Water Table Infiltration', text: 'In low-lying, historic or coastal areas like Norfolk, Portsmouth, Hampton, and Camden County, hitting water just 12 to 24 inches down is incredibly common. We integrate localized dewatering systems or coordinate fast-lay piping grids to ensure lines are placed cleanly before a trench floods.' },
      ],
    },
    faqHeading: 'Utility Engineering & Subcontracting Q&A',
    faqs: [
      { q: 'What is your pricing structure for subcontracting to other trades?', a: 'We offer highly competitive, predictable pricing sheets tailored specifically for electrical, plumbing, and mechanical contractors. By acting as your dedicated trenching subcontractor, we save your crew from hauling heavy excavators to the site or wasting manual labor hours with hand shovels. We show up, cut the line cleanly, and step aside so your technicians can lay pipe or pull wire with zero down-time.' },
      { q: 'How much damage will a mechanical trencher do to my established lawn?', a: 'We intentionally utilize compact, high-flotation rubber track machinery that distributes vehicle weight evenly across the ground. Unlike massive, heavy dump trucks or standard wheeled backhoes that leave deep, destructive ruts across your grass, our equipment leaves an exceptionally light footprint. The resulting trench is tight, straight, and narrow — meaning far less dirt is displaced and your lawn can heal completely within just a few weeks of backfilling.' },
    ],
    areaList: {
      heading: 'Serving All Trade Networks Across Hampton Roads & NE North Carolina',
      areas: ['Virginia Beach', 'Chesapeake', 'Suffolk', 'Norfolk', 'Portsmouth', 'Smithfield', 'Carrollton', 'Hampton', 'Yorktown', 'Moyock', 'Currituck County', 'Camden County'],
    },
    cta: {
      heading: 'Need a clean, code-compliant line cut for your next project?',
      sub: 'Don’t risk utility damage or break your back with a shovel. Contact us today to receive our commercial subcontractor pricing sheet or to schedule an on-site path assessment.',
    },
  },
  {
    slug: 'landscape-excavation',
    name: 'Landscape Excavation',
    short: 'Commercial-grade landscape excavation, site clearing and structural dirt work with laser-guided accuracy — built to handle both weight and water.',
    icon: 'excavate',
    image: { src: '/img/landscape-excavation.jpg', alt: 'Rip-rap stone drainage channel excavated through a wooded landscape' },
    body: [
      'A spectacular outdoor space requires far more than just planting grass and dropping mulch — it requires proper structural earthwork. Before you can build a new outdoor living area, a dirt bike track, a multi-tiered playground, or a patio, you must ensure the underlying ground is cleared, excavated, and structurally prepared to handle both weight and water.',
      'We provide commercial-grade landscape excavation, site clearing, and structural dirt work services throughout Hampton Roads and Northeastern North Carolina. Whether you need an overgrown lot cleared, large-scale earth moved for a recreational property layout, or precision grading for a hardscape project, we bring the right machinery and laser-guided accuracy to get the job done right.',
    ],
    bullets: ['Site prep for landscaping & hardscape', 'Right-sized equipment for residential lots', 'Debris & spoil hauled off', 'Paired with grading & drainage'],
    challenges: {
      eyebrow: 'Earthwork Services',
      heading: 'Precision Earthwork for Any Outdoor Project',
      intro: 'We execute heavy-duty site prep tailored to the exact engineering requirements of your landscape or recreational designs:',
      items: [
        { title: 'Hardscape & Patio Prep', text: 'Excavating uniform, packed sub-grades for stone patios, retaining walls, outdoor kitchens, and heavy concrete slabs.' },
        { title: 'Property Clearing & Brush Removal', text: 'Stripping thick brush, removing invasive root balls, and cleaning up undergrowth to reclaim raw acreage.' },
        { title: 'Recreational Dirt Work', text: 'Bulk earth-moving, banking, and contouring for custom property developments, including private dirt bike trails, custom jumps, and specialized play structures.' },
        { title: 'Pond & Water Feature Excavation', text: 'Shaping precision slopes, depths, and containment contours for structural retention ponds or decorative water features.' },
      ],
    },
    features: {
      eyebrow: 'Soil Conditions',
      heading: 'Navigating the Subsurface Earth Challenges of the Coast',
      intro: 'Moving earth in our regional footprint requires specialized machinery and techniques to handle highly unstable, contrasting soil profiles without destroying your property:',
      items: [
        { title: 'The Clay Mass Clump', text: 'In Chesapeake, Suffolk, and Moyock, native clay soils turn into a sticky, dense mess when wet and rock-hard when dry. We utilize heavy-duty track machinery and specialized tooth buckets to slice through compacted clay layers effortlessly.' },
        { title: 'Shifting Sand Formations', text: 'In Virginia Beach, Currituck County, and coastal zones, digging too deeply into sandy soil can cause immediate slope cave-ins. We shape and tier our excavations at correct safety angles to guarantee a stable, non-shifting foundation.' },
        { title: 'Sub-Surface Water Infiltration', text: 'In low-lying or historic water-front sectors like Norfolk, Portsmouth, and Hampton, hitting the water table can happen just a foot below the turf. We combine our excavations with temporary dewatering arrays to ensure base materials are set and packed on completely dry ground.' },
      ],
    },
    process: {
      heading: 'Our Commercial-Grade Site Preparation Blueprint',
      intro: 'We don’t just clear a path and hope for the best. Every excavation project follows a strict structural engineering sequence to guarantee long-term property stability.',
      items: [
        { title: '811 Line Tracking & Path Cleared', text: 'Before any tracks spin, we fully map out the excavation footprint and verify all underground utility locations via 811 to guarantee a 100% safe, damage-free project site.' },
        { title: 'Vegetation Stripping & Tree Removal', text: 'Using heavy-duty land clearing equipment, we strip away unwanted trees, dense brush, and thick surface organic matter, hauling away debris to reveal the clean sub-grade dirt beneath.' },
        { title: 'Laser-Guided Excavation & Contouring', text: 'We cut down high hummocks and fill in deep ruts, tracking the entire process with digital laser transits to ensure the new terrain matches the exact design elevations and drainage pitches required.' },
        { title: 'Septic-Grade Aggregate Base & Compaction', text: 'When preparing for heavy structures, we lay down a foundational bed of washed, septic-grade aggregate or clean fill dirt. We then hit the material with commercial-grade vibratory compactor rollers to eliminate any hollow pockets.' },
        { title: 'Topsoil Dress & Fine-Level Smoothing', text: 'We place a uniform layer of premium, clean topsoil across the final layout, executing a razor-sharp fine grade so the ground is fully primed for immediate sod laying, hydroseeding, or structural landscape building.' },
      ],
    },
    faqHeading: 'Landscape Excavation & Property Engineering Q&A',
    faqs: [
      { q: 'What is the advantage of using track machinery over standard wheeled backhoes?', a: 'Standard heavy backhoes with large rubber tires exert an immense amount of localized downward pressure, meaning they will leave massive, ankle-twisting ruts across your grass and permanently compact your lawn’s topsoil structure. We intentionally use high-flotation, compact rubber-track skid steers and excavators. These tracks distribute the machine’s weight across a massive surface area, giving us incredible pushing power while leaving a remarkably light footprint that preserves the health of your remaining lawn.' },
      { q: 'How do you make sure an excavated site doesn’t wash away during the next heavy storm?', a: 'Erosion control is a critical part of our excavation planning. When we alter slopes or clear heavy vegetation in areas like Smithfield, Yorktown, or Camden County, we don’t leave raw earth exposed to the elements. We immediately track-pack the soil to create micro-ridges that slow down sheet-flow rainwater, construct strategic swales to divert runoff, and can implement temporary straw wattles, silt fencing, or immediate hydroseeding to secure the newly sculpted earth before the next heavy coastal storm rolls through.' },
    ],
    cta: {
      heading: 'Ready to reshape your property?',
      sub: 'Don’t risk structural shifting or land erosion by cutting corners on the dirt work. Contact us today to schedule a comprehensive on-site laser grade assessment and landscape excavation consultation.',
    },
  },
  {
    slug: 'pool-liner-protection-1',
    name: 'Pool Liner Protection',
    short: 'Linerlock subsurface hydrostatic relief systems that intercept rising groundwater before it can float, stretch or tear your vinyl pool liner.',
    icon: 'pool',
    image: { src: '/img/pool-liner-protection.jpg', alt: 'New drain access cover installed in a stamped concrete pool deck beside a vinyl liner pool' },
    body: [
      'For homeowners with inground vinyl liner pools across the coastal Tidewater and Northeast North Carolina corridors, heavy rain events bring a hidden, expensive threat: floating pool liners.',
      'When massive rainstorms or coastal Nor’easters dump inches of water onto flat, low-lying ground, the water table beneath your yard rises rapidly. This creates intense hydrostatic pressure beneath your pool. If the groundwater pressure outside the pool becomes greater than the weight of the water inside the pool, the water forces its way under the vinyl, causing it to float, stretch, wrinkle, and potentially tear or shift completely out of its track.',
      'We design and install advanced, heavy-duty Linerlock pool drainage systems — subsurface hydrostatic relief systems engineered to intercept rising groundwater before it can lift your pool liner, routing it safely away to a mechanical discharge point.',
      'A downspout washing out onto pool concrete is exactly the problem that led Bryson to start Rain Drains in the first place.',
    ],
    bullets: ['Relieves hydrostatic pressure', 'Protects liners & surrounding concrete', 'Routes downspout runoff away from the pool', 'Prevents costly liner failures'],
    challenges: {
      heading: 'Why Coastal Pool Liners Float and Fail',
      intro: 'Vinyl liner pools act exactly like a boat hull buried in the ground. When the earth saturates, it creates an intense upward buoyancy force that targets the weakest structural points:',
      items: [
        { title: 'The Saturated Clay Bathtub Effect', text: 'In Chesapeake, Suffolk, and Moyock, heavy clay soils don’t absorb water quickly. Rainwater pools in the loose backfill zone directly around your pool walls, filling up like an underground bathtub and putting instant pressure on the vinyl walls.' },
        { title: 'The Tidal High Water Table', text: 'In low-lying coastal areas like Virginia Beach, Norfolk, Portsmouth, and Currituck County, the water table naturally rests just a few feet below the surface. During high tides or prolonged downpours, groundwater rises instantly beneath pool floors.' },
        { title: 'Surface Deck Runoff', text: 'If your pool deck or patio isn’t graded correctly, thousands of gallons of surface sheet-flow water will run straight off the concrete and seep directly down behind the pool coping, trapping water behind the liner.' },
      ],
    },
    process: {
      heading: 'Anatomy of an Engineered Pool Liner Relief System',
      intro: 'We don’t rely on basic residential fixes. We build a commercial-grade subterranean protection grid around your pool framework to ensure your liner stays locked flat against the pool walls.',
      items: [
        { title: 'Perimeter Excavation and Sump Tank Installation', text: 'We carefully excavate a deep, localized drainage channel around the exterior perimeter of the pool framework, cutting down below the level of the liner support to intercept rising groundwater early.' },
        { title: 'Non-Woven Geotextile Fabric Lining', text: 'The raw trench is lined with premium, non-woven geotextile filter fabric. This allows groundwater to seep into the system freely while blocking fine sand, silt, and clay particles from clogging the drainage core.' },
        { title: '#57 Clean Aggregate & Drainage Grate', text: 'We lay a deep bed of washed #57 drainage stone to backfill the sump tank. This subsurface grid constantly draws groundwater down and away from the vinyl walls. We make a surgical cut in the liner support wall and install a drain that sits flush on the back side of your liner.' },
        { title: 'Heavy-Duty Outdoor Sump Station Tie-In', text: 'Because gravity alone can’t push water uphill in flat coastal terrains, the collection line routes directly into a dedicated outdoor sump pump basin. A continuous-duty cast-iron pump mechanically lifts the water and forces it completely off your property to a storm drainage system, nearby body of water, or a ditch.' },
      ],
    },
    faqHeading: 'Pool Drainage & Hydrostatic Engineering Q&A',
    faqs: [
      { q: 'What happens to the pool drainage system if the power goes out during a major storm?', a: 'Severe coastal storms and Nor’easters across the Tidewater region often bring power grid failures. If the electrical grid drops and you do not have a backup power source, the main sump pump will temporarily stop running. Without mechanical extraction, the subsurface water table will rise, the groundwater will exert intense hydrostatic pressure, and the pool liner will float until power returns. To prevent this altogether, we recommend integrating your pumping station directly into an existing whole-home backup generator system. However, if your pump does lose power and the liner floats, there is a reassuring mechanical fail-safe built into our system’s engineering: once power is fully restored, the pump kicks back on and will naturally draw the groundwater table back down around the liner, vacuum-securing the vinyl liner tightly against the pool framework once again.' },
      { q: 'What is the permanent solution to prevent a pool liner from floating?', a: 'The only permanent, definitive solution to a floating pool liner is to control the groundwater table dynamically around the pool. It is a physical impossibility for a liner to float if the water table beneath the pool deck is kept lower than the pool floor. Our Linerlock Pool Drainage System acts as a permanent, automatic underground defense system. By supporting the pool structure with a deep network of washed #57 stone and a drainage grate in the liner support, groundwater is constantly drawn into a dedicated subsurface highway before it can push against the vinyl. That water is routed directly to a heavy-duty, continuous-duty cast-iron outdoor sump pump station that mechanically lifts and evacuates the water from your property. Once installed, it runs completely on its own, keeping the subterranean hydrostatic pressure on your liner at zero and locking your liner flat for life.' },
      { q: 'Can a pool drainage system be installed around an existing pool?', a: 'Yes. While it is easiest to install a hydrostatic relief network during new pool construction, we routinely retrofit existing pools that are suffering from chronic liner floating issues. We carefully excavate along the edge of your existing concrete pool deck or softscape to drop in our perimeter collection lines, tying them into a main mechanical pumping station.' },
    ],
    areaList: {
      heading: 'Serving All Swimming Pool Communities Across the Tidewater Areas and Beyond',
      areas: ['Virginia Beach', 'Chesapeake', 'Suffolk', 'Norfolk', 'Portsmouth', 'Smithfield', 'Carrollton', 'Hampton', 'Yorktown', 'Moyock', 'Currituck County', 'Camden County'],
    },
    cta: {
      heading: 'Don’t let the next heavy coastal downpour ruin your pool',
      sub: 'Protect your vinyl investment and keep your liner permanently locked in place. Contact us today to schedule an expert on-site pool perimeter drainage audit and water table assessment.',
    },
  },
  {
    slug: 'hydrojet-cleanout-1',
    name: 'Hydrojet Cleanout',
    short: 'Commercial-grade hydrojetting that blasts away compacted silt, sand and invasive roots to restore clogged drainage lines to 100% capacity.',
    icon: 'jet',
    image: { src: '/img/hydrojet-cleanout.jpg', alt: 'Hydrojet nozzle spraying high-pressure water to clear a clogged drainage line' },
    body: [
      'When a heavy-duty yard drain, French drain, downspout extension, or culvert pipe becomes packed solid with mud, invasive roots, sand, or thick organic debris, a standard plumbing snake or mechanical auger will not solve the problem. A traditional metal cable snake merely punches a temporary hole through the blockage, leaving the surrounding walls caked in silt, which leads to immediate re-clogging during the next heavy storm.',
      'True restoration requires professional hydrojet drainage system cleanout services. Hydrojetting utilizes commercial-grade, multi-directional high-pressure water streams to blast away compressed sediment, slice cleanly through invasive roots, and completely scrub the interior walls of your underground pipes. We specialize in clearing and flushing out subsurface stormwater grids to restore your property’s drainage infrastructure to 100% capacity.',
    ],
    bullets: ['Clears roots, silt & debris', 'No digging required', 'Recommended every 2–3 years', 'Extends the life of your system'],
    challenges: {
      heading: 'Why Coastal Drainage Systems Get Blocked Up',
      intro: 'Subsurface exterior drains manage massive volumes of debris-laden runoff, making them uniquely susceptible to specific types of structural blockages over time:',
      items: [
        { title: 'The Silt & Clay Pack', text: 'In communities like Chesapeake and Suffolk, stormwater carries fine clay particles into underground lines. Over time, this clay settles to the bottom of horizontal pipes, baking into a dense, rock-hard mud pack that standard water pressure from a garden hose can never move.' },
        { title: 'The Sandy Coastal Infiltration', text: 'In sandy soil corridors like Virginia Beach and Currituck County, high-volume downpours force fine sand through micro-fissures or unsealed pipe joints. The sand settles inside the lines, acting like heavy cement that chokes off water velocity.' },
        { title: 'Tree Root Intrusions', text: 'In historic or heavily wooded residential zones like Norfolk, Portsmouth, Hampton, and Yorktown, tree and landscape roots naturally seek out moisture. They break through pipe joins, forming massive, sponge-like root balls inside downspout lines and French drains that trap debris and cause immediate yard flooding.' },
      ],
    },
    process: {
      heading: 'The Hydrojetting Process: How We Scour the Lines',
      items: [
        { title: 'Cleanout Locator & Entry Setup', text: 'We locate your system’s existing inline cleanout ports or strategically access the network from discharge points like catch basins, culverts, or pop-up emitters to establish a clear run into the main lines.' },
        { title: 'Calibrating Multi-Directional Jets', text: 'We select a specialized jetting nozzle tailored to your specific blockage — such as a forward-penetrating nozzle to split dense mud walls, or a spinning root-cutter head to slice away invasive fibers.' },
        { title: 'High-Pressure Hydro-Scouring', text: 'The hydrojet hose is mechanically fed up into the line. While traveling, rear-facing water jets propel the nozzle forward with incredible velocity while simultaneously blasting dirt, sand, and roots backward out of the pipe.' },
        { title: 'System Flush & Mass Evacuation', text: 'We pulse high-pressure streams repeatedly through the entire network, liquefying decades of built-up sediment and completely evacuating it out of the line until the pipe’s smooth-interior is pristine.' },
      ],
    },
    faqHeading: 'High-Pressure Drainage Cleanout Q&A',
    faqs: [
      { q: 'Will hydrojetting destroy my underground plastic or PVC drainage pipes?', a: 'Not when executed by an experienced professional. We meticulously tune our jetting rigs to match the exact material profile of your underground lines. For heavy-duty, smooth-wall rigid PVC or corrugated pipes we can apply high-velocity pressures safely to sweep out stubborn sediment. If your property relies on fragile, thin-walled corrugated piping, traditional high-pressure jetting can easily rip through the seams; in those cases, we adapt our system to a low-pressure, high-volume hydraulic flush to safely clear the line without causing structural collapse.' },
      { q: 'Will you be able to replace or repair components if lines need to be repaired?', a: 'If our jetting process reveals that a pipe has completely collapsed due to tree roots or heavy vehicle compaction, we perform localized excavations to cut out the failure zone. When we rebuild these sections or add brand-new inline access ports, we never use cheap residential plastics. This ensures your newly cleared lines stay perfectly aligned and fully operational for decades.' },
      { q: 'How often should my property’s drainage system be jet-cleaned?', a: 'For properties with high tree canopy coverage (common in areas like Smithfield, Carrollton, or Camden County), or low-lying sites facing heavy sand runoff near Moyock and Virginia Beach, we recommend a preventative hydrojet maintenance flush every 2 to 3 years. Keeping your underground lines scoured clear prevents sudden, catastrophic backups during major seasonal storms, hurricanes, or coastal Nor’easters when your drainage system needs to perform at 100% capacity.' },
    ],
    areaList: {
      heading: 'Proudly Servicing All Local Coastal & Suburban Trade Corridors',
      areas: ['Virginia Beach', 'Chesapeake', 'Suffolk', 'Norfolk', 'Portsmouth', 'Smithfield', 'Carrollton', 'Hampton', 'Yorktown', 'Moyock', 'Currituck County', 'Camden County'],
    },
    cta: {
      heading: 'Are your yard drains backed up and bubbling over?',
      sub: 'Don’t let packed mud and invasive roots ruin your property’s drainage infrastructure. Contact us today to schedule an expert on-site hydrojet cleanout evaluation.',
    },
  },
]

// Shared "holistic stormwater management" content used across several
// service-area pages — identical boilerplate per raindrainsva.com except
// the city name and its local neighborhood/subdivision list.

// The structural-drainage process and regional FAQ are verbatim-identical
// across every variant of this template seen so far (coastal and urban-core).
const STORMWATER_PROCESS = {
  heading: 'High-Performance Structural Drainage Solutions',
  intro: 'We engineer custom, subsurface networks designed to isolate your foundation and landscape from high groundwater pressures, forcing water completely off your property.',
  items: [
    { title: 'Elevation & Flow Evaluation', text: 'We map your property’s exact elevation drops using high-precision digital laser transits. We locate the precise structural low-points where surface water and groundwater converge.' },
    { title: 'Non-Woven Geotextile Armor Layout', text: 'We excavate deep collection channels or foundation footprints and line the raw earth with heavy-duty non-woven geotextile fabric. This allows groundwater to seep in freely while blocking fine sand and silt from clogging your system.' },
    { title: 'Septic-Grade PVC & Aggregate Setting', text: 'We install ultra-thick, smooth-wall perforated or solid septic-grade PVC conduits enveloped in clean #57 washed drainage stone. These lines resist extreme subterranean pressures and maximize water velocity.' },
    { title: 'Outdoor Sump Station Integration', text: 'Because our regional terrain is incredibly flat, we tie our drainage grids directly into heavy-duty outdoor sump pump basins featuring commercial cast-iron pumps to mechanically lift and push water to a legal discharge main.' },
    { title: 'Precision Grading & Multi-Lift Compaction', text: 'We backfill our trenches or driveways in strategic layers ("lifts"), mechanically packing the earth with vibratory rollers and shaping a subtle center crown or outward slope so surface water sheds immediately.' },
  ],
}
const STORMWATER_FAQ_HEADING = 'Regional Drainage & Engineering Q&A'
const STORMWATER_FAQS = [
  { q: 'What does "holistic stormwater management" actually mean for my property?', a: 'It means treating all water as part of a connected ecosystem. For example, capturing your roof runoff through underground downspout lines does no good if your yard grading forces surface water right back against your foundation. Similarly, a French drain meant to lower the groundwater table will quickly fail if it gets overwhelmed by surface mud or has nowhere to discharge. Our holistic approach connects your roof drainage, surface grading, sub-surface French drains, and foundation waterproofing membranes into a single fluid highway that routes all water to its proper termination point without bottlenecks.' },
  { q: 'What is the permanent solution to prevent a vinyl pool liner from floating during a heavy rain event?', a: 'The only permanent, definitive solution to a floating pool liner is to dynamically control the groundwater table directly around the pool. Vinyl pools act exactly like a hollow boat hull; when intense rainstorms hit our flat coastal developments, the groundwater table rises instantly, creating massive upward pressure. If that pressure exceeds the weight of the water inside your pool, it forces its way underneath, causing your liner to stretch, float, and wrinkle. Our Linerlock Pool Drainage System solves this permanently. We install a deep subsurface aggregate highway around your pool structure to collect rising groundwater before it touches your vinyl, routing it to an automated cast-iron sump station. Even if a storm knocks out your power grid and causes the liner to float temporarily, the moment power returns or your backup generator kicks in, the system draws the water table back down, vacuum-securing the liner tightly against the pool walls again.' },
  { q: 'Will your heavy excavation equipment destroy my yard, driveway, or landscape?', a: 'Many homeowners dread hiring an excavation contractor because massive dump trucks and standard wheeled backhoes leave deep, destructive ruts across grass and crack established concrete. We protect your property by intentionally operating compact, high-flotation rubber-track machinery (like specialized mini-excavators and stand-on skid steers). These continuous rubber tracks spread the machine’s weight evenly across a large surface area, giving us maximum pushing and lifting power while leaving an exceptionally light footprint that preserves your topsoil and turf.' },
]

function regionalStormwaterTemplate(cityName, neighborhoods) {
  return {
    heroTitle: `Stormwater Management in ${cityName}`,
    short: `Holistic stormwater management engineered for ${cityName}’s sandy, high-water-table coastal terrain — from roof runoff to rising groundwater to pool protection.`,
    body: [
      `If you own a home, commercial property, or coastal estate in ${cityName} your property sits directly on the front lines of the Atlantic water table. This region is defined by highly dynamic sandy topsoils, expansive master-planned developments, and immediate proximity to sea-level sounds, bays, and rivers.`,
      'When heavy downpours, seasonal hurricanes, or coastal Nor’easters hit this corridor, water doesn’t just pool on top of the grass — it saturates the earth from the bottom up. True property protection requires holistic stormwater management — an engineered approach that treats your roof runoff, surface sheet-flow, rising subsurface groundwater, and pool structures as a single, unified ecosystem.',
      'We provide commercial-grade, comprehensive drainage infrastructures built specifically for coastal soil mechanics. We build our integrated systems using thick, septic-grade components and industrial stainless steel fasteners so they stay locked, clear, and fully operational for decades.',
    ],
    bullets: [`Free on-site estimates in ${cityName}`, 'Engineered for sandy, high-water-table coastal soil', 'Holistic roof-to-groundwater system design'],
    note: {
      heading: 'The Holistic Stormwater Architecture for Coastal Terrains',
      text: 'An effective water management strategy must control water at every stage of a storm event. In sandy, high-water-table zones, surface water routes must work in perfect harmony with subsurface water evacuation to prevent localized flooding and structural failures.',
    },
    challenges: {
      heading: 'The Reality of Coastal Soil & Water: Why Your Property Floods',
      intro: 'Properties in the Chesapeake, Virginia Beach, and Northeast North Carolina footprints face strict environmental factors that demand specialized engineering:',
      items: [
        { title: 'The Tidal High Water Table', text: 'In low-lying and ocean-facing districts, the natural water table sits just a few feet below your turf. During prolonged downpours or high-tide cycles, the ground completely saturates from beneath, leaving rainwater with absolutely nowhere to soak into.' },
        { title: 'Sandy Soil Infiltration & Cave-Ins', text: 'While sand allows water to pass through initially, loose coastal sand is highly volatile. Heavy storms wash fine sand straight into unsealed drainage pipe joints, packing lines solid like cement and choking off water flow.' },
        { title: 'The Clay Transition Zone', text: 'Parts of Southern Chesapeake, Moyock, and Camden hit dense, heavy native clay layers just beneath the topsoil. This clay traps water on the surface, creating an underground "bathtub effect" around foundation blocks, crawlspaces, and concrete pool shells.' },
      ],
    },
    process: STORMWATER_PROCESS,
    faqHeading: STORMWATER_FAQ_HEADING,
    faqs: STORMWATER_FAQS,
    areaList: {
      eyebrow: 'Neighborhoods',
      heading: 'Local Neighborhoods & Subdivisions We Serve',
      intro: `We provide direct drainage for residential, commercial, and trade-subcontracting services throughout all local zip codes, master-planned developments, and coastal corridors across ${cityName}, including:`,
      areas: neighborhoods,
    },
    cta: {
      heading: 'Is standing water destroying your yard or foundation?',
      sub: 'Don’t waste money throwing loose gravel into failing mud holes. Contact us today to schedule a comprehensive on-site laser grade assessment and engineering consultation.',
    },
  }
}

// Variant for the heavy-clay, rolling-terrain "western ridge" cluster
// (Suffolk, Smithfield, Carrollton — referred to as "Zone 3" in the source
// copy). Shares some process steps with the other variants but not all, and
// carries 5 FAQs instead of 3, so it isn't built from the shared constants.
function clayRidgeStormwaterTemplate(cityName, neighborhoods) {
  return {
    heroTitle: `Stormwater Management in ${cityName}`,
    short: `Holistic stormwater management engineered for ${cityName}’s heavy clay soil and rolling terrain — from roof runoff to rising groundwater to pool protection.`,
    body: [
      `If you own a home, commercial property, or rural acreage along the western ridge in ${cityName}, your land battles a completely different geological adversary than the rest of the Tidewater region. This corridor is defined by expansive agricultural tracts, rapid residential growth on massive lots, rolling hills, and some of the most stubborn, unforgiving soil profiles in Virginia.`,
      'When heavy downpours, seasonal storms, or sudden shifts in the river basins hit this area, water doesn’t simply soak away. Patchwork drainage fixes like a quick surface trench or a standalone interior pump will fail. True property protection requires holistic stormwater management — an engineered approach that treats your roof runoff, heavy surface sheet-flow, deep subterranean groundwater, and critical foundation defenses as a single, unified system.',
      'We provide commercial-grade, comprehensive drainage infrastructures engineered specifically to conquer heavy clay and sloping terrain. We build our integrated systems using thick, septic-grade components and industrial stainless steel fasteners so they stay locked, clear, and fully operational for decades.',
    ],
    bullets: [`Free on-site estimates in ${cityName}`, 'Engineered for heavy clay soil & rolling terrain', 'Holistic roof-to-groundwater system design'],
    note: {
      heading: 'Stormwater Architecture for Clay & Slopes',
      text: 'An effective water management strategy must control water at every stage of a storm event. In heavy clay and rolling terrain, surface control structures must intercept massive sheet-flow volumes, working in perfect harmony with subsurface networks to relieve hydrostatic pressure before it attacks your foundation or crawlspace.',
    },
    challenges: {
      heading: 'The Reality of Western Ridge Earth: Why Your Property Floods',
      intro: 'Properties in the Suffolk, Smithfield, and Carrollton footprints face rigid environmental factors that demand heavy-duty civil engineering standards:',
      items: [
        { title: 'The Unyielding Clay Barrier', text: 'The native soil here is packed solid with heavy, compact clay. Clay acts like a dense rubber sheet underneath your lawn — it absorbs water incredibly slowly and swells up when wet. Rainwater traps right on the surface, turning your yard into a muddy swamp that can take days or weeks to dry out.' },
        { title: 'The Clay Bathtub Effect', text: 'When your home was built, the earth directly surrounding your foundation block or crawlspace was dug up and loosened. Rainwater naturally rushes into this loose soil first, creating an underground "bathtub" of trapped water held tightly against your masonry by the surrounding unbroken native clay.' },
        { title: 'Rolling Hills & Ravine Washouts', text: 'Unlike the flat coastal strips, our western ridge features significant elevation drops and rolling terrain. During a heavy storm, thousands of gallons of water speed down these hillsides as "sheet-flow," quickly eroding topsoil, washing out driveways, and collecting in massive pools at the low points of your yard.' },
        { title: 'Under-Engineered Driveway Culverts', text: 'Many rural and acreage properties rely on shallow roadside ditches or undersized driveway culverts. When upstream water hits a bottlenecked culvert, it backs up immediately, flooding your driveway base and compromising the structural integrity of your entry point.' },
      ],
    },
    process: {
      heading: 'High-Performance Structural Drainage Solutions',
      intro: 'We engineer custom, subsurface networks designed to isolate your foundation and landscape from intense clay water pressures, forcing water completely off your property.',
      items: [
        { title: 'Elevation & Flow Evaluation', text: 'We map your property’s exact elevation drops using high-precision digital laser transits. We locate the precise structural low-points where surface water and groundwater converge.' },
        { title: 'Woven Geotextile Armor Layout', text: 'We excavate deep collection channels or foundation footprints and line the raw earth with heavy-duty woven geotextile fabric. This prevents fine, heavy clay mud from squeezing up and clogging your clean drainage stone over time.' },
        { title: 'Septic-Grade PVC & Aggregate Setting', text: 'We install ultra-thick, smooth-wall perforated or solid septic-grade PVC conduits enveloped in clean #57 washed drainage stone. These lines resist extreme subterranean pressures and maximize water velocity.' },
        { title: 'Outdoor Sump Station Integration', text: 'Where gravity discharge isn’t naturally accessible due to terrain pockets, we tie our drainage grids directly into heavy-duty outdoor sump pump basins featuring commercial cast-iron pumps to mechanically lift and push water to a legal discharge main.' },
        { title: 'Precision Grading & Multi-Lift Compaction', text: 'We backfill our trenches or driveways in strategic layers ("lifts"), mechanically packing the earth with vibratory rollers and shaping a subtle center crown or outward slope so surface water sheds immediately.' },
      ],
    },
    faqHeading: 'Regional Drainage & Engineering Q&A',
    faqs: [
      { q: 'What does "holistic stormwater management" actually mean for my property?', a: 'It means treating all water as part of a connected ecosystem. For example, capturing your roof runoff through underground downspout lines does no good if your yard grading forces surface water right back against your foundation. Similarly, a French drain meant to lower the groundwater table will quickly fail if it gets overwhelmed by surface mud or has nowhere to discharge. Our holistic approach connects your roof drainage, surface grading, sub-surface French drains, and foundation waterproofing membranes into a single fluid highway that routes all water to its proper termination point without bottlenecks.' },
      { q: 'Why are standard retail French drains failing in our local clay soils?', a: 'Most standard residential French drain installations fail within 2 to 4 years because they are built using thin, black corrugated plastic pipe wrapped in cheap fabric socks. In heavy clay regions like Suffolk, Smithfield, and Carrollton, the fine clay silt rapidly plugs up those tiny fabric pores, while the weight of the water-logged clay crushes the flexible pipe. Many landscapers and other DIY "drainage professionals" will overprescribe the use of French drains, which are destined to fail within a short time period. When we install French drains, we ensure the materials and design are built to withstand heavy rains over an extended life, maximizing the effectiveness and the cost of investment.' },
      { q: 'How do you permanently prevent a vinyl pool liner from floating during a heavy rain event?', a: 'The only permanent, definitive solution to a floating pool liner is to dynamically control the groundwater table directly around the pool. Vinyl pools act exactly like a hollow boat hull; when intense rainstorms hit our developments, the groundwater table rises instantly, creating massive upward pressure. If that pressure exceeds the weight of the water inside your pool, it forces its way underneath, causing your liner to stretch, float, and wrinkle. Our Linerlock Pool Drainage System solves this permanently. We install a deep subsurface aggregate highway around your pool structure to collect rising groundwater before it touches your vinyl, routing it to an automated cast-iron sump station. Even if a storm knocks out your power grid and causes the liner to float temporarily, the moment power returns or your backup generator kicks in, the system draws the water table back down, vacuum-securing the liner tightly against the pool walls again.' },
      { q: 'What is the difference between builder-grade "dampproofing" and exterior waterproofing?', a: 'If your home has a damp crawlspace or a leaking foundation, it’s likely because the builder applied a cheap, thin coat of asphalt tar ("dampproofing") to meet bare-minimum building codes. Over time, that material dries out, becomes brittle, and cracks. True exterior waterproofing requires excavating down to your concrete footings, sealing cracks with hydraulic cement, applying a thick elastomeric liquid rubber membrane that flexes with your home, and hanging dimpled poly-matrix drainage boards. We secure these heavy-duty armor systems in place using industrial-grade stainless steel fasteners that will never rust or rot in our highly acidic subterranean soils.' },
      { q: 'Will your heavy excavation equipment destroy my yard, driveway, or landscape?', a: 'Many homeowners dread hiring an excavation contractor because massive dump trucks and standard wheeled backhoes leave deep, destructive ruts across grass and crack established concrete. We protect your property by intentionally operating compact, high-flotation rubber-track machinery (like specialized mini-excavators and skid steers). These continuous rubber tracks spread the machine’s weight evenly across a large surface area, giving us maximum pushing and lifting power while leaving an exceptionally light footprint that preserves your topsoil and turf.' },
    ],
    areaList: {
      eyebrow: 'Neighborhoods',
      heading: 'Local Neighborhoods & Subdivisions We Serve',
      intro: 'We provide direct residential, commercial, and trade-subcontracting services throughout all local zip codes, master-planned developments, and rural roads across Zone 3:',
      areas: neighborhoods,
    },
    cta: {
      heading: 'Is standing water destroying your yard, cracking your foundation, or washing out your driveway?',
      sub: 'Don’t waste money throwing loose gravel into failing mud holes. Contact us today to schedule a comprehensive on-site laser grade assessment and engineering consultation.',
    },
  }
}

// Variant for dense, historic urban cores (Norfolk, Portsmouth, etc.) rather
// than low-lying suburban/coastal sprawl — shares the process + FAQ content
// with regionalStormwaterTemplate but has its own intro, note and challenges.
function urbanCoreStormwaterTemplate(cityName, neighborhoods) {
  return {
    heroTitle: `Stormwater Management in ${cityName}`,
    short: `Holistic stormwater management engineered for ${cityName}’s dense, historic urban core — tight lot lines, aging storm mains and porous historic foundations.`,
    body: [
      `If you own a home, historic property, or commercial facility within the urban core of ${cityName}, your land fights an entirely different water battle than the rural outposts. This zone is defined by historic building footprints, dense lot lines, extensive concrete impervious surfaces, and immediate vulnerability to tidal shifts and aging city stormwater mains.`,
      'When heavy downpours, seasonal Nor’easters, or high-tide backup events hit these historic urban sectors, the water has nowhere to go. A quick surface trench or a cheap interior fix won’t protect your foundation. True structural protection requires holistic stormwater management — an engineered approach that treats your roof runoff, high-volume hardscape sheet-flow, rising subsurface groundwater, and foundation barriers as a single, fully integrated system.',
      'We provide commercial-grade, comprehensive drainage infrastructures specifically engineered to navigate tight lot lines, utility crossings, and historic masonry structures. We build our integrated systems using thick, septic-grade components and industrial stainless steel fasteners so they stay locked, clear, and fully operational for decades.',
    ],
    bullets: [`Free on-site estimates in ${cityName}`, 'Engineered for tight lots & historic foundations', 'Holistic roof-to-groundwater system design'],
    note: {
      heading: 'The Holistic Stormwater Architecture for Urban & Historic Terrains',
      text: 'An effective water management strategy must control water at every stage of a storm event. In dense urban footprints with high concrete coverage, surface runoff control must prevent immediate pooling while subsurface networks dynamically relieve hydrostatic pressure against older foundation walls.',
    },
    challenges: {
      heading: 'The Reality of the Urban Core: Why Your Property Floods',
      intro: 'Properties in the Norfolk, Portsmouth, Hampton, and Newport News footprints face rigid environmental and structural factors that demand specialized civil engineering standards:',
      items: [
        { title: 'The Tidal & Storm Sewer Backup', text: 'When a heavy rain event coincides with a high tide or storm surge, the local municipal storm drain pipes fill to maximum capacity with river and bay water. Instead of your yard drainage flowing out into the city system, the city’s water pushes backward into your yard, flooding low points and driveway aprons.' },
        { title: 'High Percentage of Impervious Surfaces', text: 'Dense urban developments mean roofs, asphalt driveways, concrete patios, and city streets cover a huge percentage of the ground. Rainwater cannot soak into concrete, creating massive volumes of rapid surface sheet-flow that quickly overwhelm standard flowerbeds and grass lines.' },
        { title: 'Historic Foundations & The "Bathtub Effect"', text: 'Many homes in this zone feature historic brick foundations, crawlspaces, or basements. When rain hits the loose soil directly surrounding your house, it forms an underground "bathtub" of trapped water. Because historic brick and mortar are highly porous, this water pulls straight through your walls, causing structural rot, mold, and continuous dampness.' },
        { title: 'Tight Lot Lines & Utility Crossings', text: 'Working in the urban core means dealing with very tight spaces between neighboring homes, established root systems, and a complex web of buried gas, water, and electrical lines. Standard excavation methods can easily damage property or disrupt utilities.' },
      ],
    },
    process: STORMWATER_PROCESS,
    faqHeading: STORMWATER_FAQ_HEADING,
    faqs: STORMWATER_FAQS,
    areaList: {
      eyebrow: 'Neighborhoods',
      heading: 'Local Neighborhoods & Subdivisions We Serve',
      intro: `We provide direct drainage for residential, commercial, and trade-subcontracting services throughout all local zip codes, master-planned developments, and coastal corridors across ${cityName}, including:`,
      areas: neighborhoods,
    },
    cta: {
      heading: 'Is standing water destroying your yard or foundation?',
      sub: 'Don’t waste money throwing loose gravel into failing mud holes. Contact us today to schedule a comprehensive on-site laser grade assessment and engineering consultation.',
    },
  }
}

export const AREAS = [
  {
    slug: 'virginia-beach',
    name: 'Virginia Beach',
    state: 'VA',
    image: { src: '/img/areas/virginia-beach.jpg', alt: 'Rain Drains crew installing residential drainage in a Virginia Beach neighborhood' },
    ...regionalStormwaterTemplate('Virginia Beach', ['Little Neck', 'North End', 'Sandbridge', 'Oceanfront', 'Pungo', 'Thoroughgood', 'Red Mill', 'Landstown', 'Kempsville']),
  },
  {
    slug: 'chesapeake',
    name: 'Chesapeake',
    state: 'VA',
    image: { src: '/img/areas/chesapeake.jpg', alt: 'French drain trench installed along a Chesapeake home\'s foundation' },
    ...regionalStormwaterTemplate('Chesapeake', ['Great Bridge', 'Hickory', 'Greenbrier', 'Western Branch', 'Deep Creek', 'South Norfolk', 'Edinburgh Corridor']),
  },
  {
    slug: 'norfolk',
    name: 'Norfolk',
    state: 'VA',
    image: { src: '/img/areas/norfolk.jpg', alt: 'Compacted gravel parking pad installed at a Norfolk property' },
    ...urbanCoreStormwaterTemplate('Norfolk', ['Larchmont', 'Edgewater', 'Ghent', 'Colonial Place', 'Riverview', 'Ocean View', 'Willoughby Spit', 'Lakewood', 'Algonquin Park']),
  },
  {
    slug: 'portsmouth',
    name: 'Portsmouth',
    state: 'VA',
    image: { src: '/img/areas/portsmouth.jpg', alt: 'Concrete channel drain installed along a Portsmouth driveway' },
    ...urbanCoreStormwaterTemplate('Portsmouth', ['Olde Towne', 'Westhaven', 'Churchland', 'Cradock', 'Waterview', 'Park View']),
  },
  {
    slug: 'suffolk',
    name: 'Suffolk',
    state: 'VA',
    image: { src: '/img/areas/suffolk.jpg', alt: 'Rip-rap lined drainage channel on a wooded Suffolk property' },
    ...clayRidgeStormwaterTemplate('Suffolk', ['Downtown', 'North Suffolk', 'Harbour View', 'Driver', 'Whaleyville', 'Chuckatuck', 'Holland']),
  },
  {
    slug: 'hampton',
    name: 'Hampton',
    state: 'VA',
    image: { src: '/img/areas/hampton.jpg', alt: 'Drainage piping installed around HVAC units at a Hampton home' },
    ...urbanCoreStormwaterTemplate('Hampton', ['Downtown', 'Phoebus', 'Buckroe Beach', 'Fox Hill', 'Grandview', 'Wythe']),
  },
  {
    slug: 'newport-news',
    name: 'Newport News',
    state: 'VA',
    image: { src: '/img/areas/newport-news.jpg', alt: 'Utility trench with pipe laid along a Newport News backyard' },
    ...urbanCoreStormwaterTemplate('Newport News', ['Hilton Village', 'Denbigh', 'Oyster Point', 'Port Warwick', 'Riverside']),
  },
  {
    slug: 'smithfield',
    name: 'Smithfield',
    state: 'VA',
    image: { src: '/img/areas/smithfield.jpg', alt: 'Finished gravel driveway through a wooded Smithfield property' },
    ...clayRidgeStormwaterTemplate('Smithfield', ['Historic Downtown', 'Cypress Creek', 'Gatling Pointe', 'Moonefield', 'Pagan River Corridor']),
  },
  {
    slug: 'carrolton',
    name: 'Carrollton',
    state: 'VA',
    image: { src: '/img/areas/carrolton.jpg', alt: 'Mini excavator installing a culvert pipe on a Carrollton property' },
    ...clayRidgeStormwaterTemplate('Carrollton', ['Eagle Harbor', 'Founders Pointe', 'Nike Park Corridor', 'Marsh Road Acreage Tracts']),
  },
  {
    slug: 'currituck-county',
    name: 'Currituck County',
    state: 'NC',
    image: { src: '/img/areas/currituck-county.jpg', alt: 'Graded backyard on a wooded Currituck County property' },
    ...regionalStormwaterTemplate('Currituck County', ['Moyock', 'Panther Landing', 'Caratoke Highway Corridor', 'Cypress Landing', 'Maple', 'Grandy']),
    body: [
      'If you own a home, commercial property, or coastal estate in Moyock or Currituck County your property sits directly on the front lines of the Atlantic water table. This region is defined by highly dynamic sandy topsoils, expansive master-planned developments, and immediate proximity to sea-level sounds, bays, and rivers.',
      'When heavy downpours, seasonal hurricanes, or coastal Nor’easters hit this corridor, water doesn’t just pool on top of the grass — it saturates the earth from the bottom up. True property protection requires holistic stormwater management — an engineered approach that treats your roof runoff, surface sheet-flow, rising subsurface groundwater, and pool structures as a single, unified ecosystem.',
      'We provide commercial-grade, comprehensive drainage infrastructures built specifically for coastal soil mechanics. We build our integrated systems using thick, septic-grade components and industrial stainless steel fasteners so they stay locked, clear, and fully operational for decades.',
    ],
  },
  {
    slug: 'camden-county',
    name: 'Camden County',
    state: 'NC',
    image: { src: '/img/areas/camden-county.jpg', alt: 'Drainage swale with rip-rap outlet on a Camden County property' },
    ...regionalStormwaterTemplate('Camden County', ['South Mills', 'Camden', 'Shiloh', 'Surrounding Rural Acreage Tracts']),
  },
]

export const PAST_PROJECTS = [
  { src: '/img/gallery/g01.jpg', alt: 'French drain trench dug along a home\'s foundation' },
  { src: '/img/gallery/g02.jpg', alt: 'Backyard graded and leveled near a wooded pond property' },
  { src: '/img/gallery/g03.jpg', alt: 'Rain Drains crew installing drainage pipe at a commercial building' },
  { src: '/img/gallery/g04.jpg', alt: 'New culvert pipe outlet beneath a sidewalk' },
  { src: '/img/gallery/g05.jpg', alt: 'Culvert pipe and rip-rap stone at a driveway entrance' },
  { src: '/img/gallery/g06.jpg', alt: 'Front yard drainage trench with pipe run to the curb' },
  { src: '/img/gallery/g07.jpg', alt: 'Catch basin drain installed in a concrete patio slab' },
  { src: '/img/gallery/g08.jpg', alt: 'Compacted gravel parking pad installation' },
  { src: '/img/gallery/g09.jpg', alt: 'Utility trench with pipe laid along a backyard' },
  { src: '/img/gallery/g10.jpg', alt: 'Fresh sod laid along a driveway after drainage work' },
  { src: '/img/gallery/g11.jpg', alt: 'New drain installed in a stamped concrete pool deck' },
  { src: '/img/gallery/g12.jpg', alt: 'Catch basin and pipe fittings staged for a drainage install' },
  { src: '/img/gallery/g13.jpg', alt: 'Rain Drains crew operating an excavator in a front yard' },
  { src: '/img/gallery/g14.jpg', alt: 'Commercial drainage trenching with excavation equipment on site' },
  { src: '/img/gallery/g15.jpg', alt: 'Rip-rap lined erosion control channel' },
  { src: '/img/gallery/g16.jpg', alt: 'Mini excavator installing culvert pipe and rip-rap stone' },
  { src: '/img/gallery/g17.jpg', alt: 'Finished gravel driveway through wooded property' },
  { src: '/img/gallery/g18.jpg', alt: 'Drainage piping routed around HVAC units' },
  { src: '/img/gallery/g19.jpg', alt: 'Concrete channel drain with metal grate along a driveway' },
  { src: '/img/gallery/g20.jpg', alt: 'Drainage swale with rip-rap outlet at dusk' },
  { src: '/img/gallery/g21.jpg', alt: 'Excavation work along a home\'s foundation' },
  { src: '/img/gallery/g22.jpg', alt: 'Freshly graded residential lot between homes' },
  { src: '/img/gallery/g23.jpg', alt: 'Lot graded and leveled ahead of sod installation' },
  { src: '/img/gallery/g24.jpg', alt: 'Backyard drainage trench and catch basin near a patio' },
]

export const REVIEWS = [
  { name: 'James LaZar', when: '1 month ago', text: 'Bryson is the true deal! He came out next day and got me situated. The workers that came out were honestly hands down the best. Communication and Execution just top notch!' },
  { name: 'Amber Morgan', when: '4 weeks ago', text: 'Bryson listened to our problem and set up an appointment. We received an extremely reasonable quote and a work date. The crew arrived on time and finished the job in one day. They were efficient and respectful of my property. I HIGHLY recommend their services.' },
  { name: 'Tony Cannady', when: '4 weeks ago', text: 'Rain Drains was amazing. Bryson the owner was awesome. He actually took the time to come out and work with us face-to-face, and they were able to complete an install in one day very professionally. I would recommend them to anyone.' },
]

export const FAQS = [
  { q: 'Do I need a permit to install a drainage system?', a: 'Different cities have different regulations regarding drainage systems, gutter extensions, and pool system drainage. What is allowed in one city may not be allowed in another. Rest assured that we will do the research and obtain the proper permit for your installation.' },
  { q: 'How long will the installation take?', a: 'A typical drainage system installation consisting of 200 linear feet or less of piping will take about half a day. That timeline can vary greatly based on the complexity and size of the system. However, we expect to complete most residential drainage work in one business day.' },
  { q: 'Will my utilities be damaged?', a: 'We always aim to never disturb utilities and have an excellent track record of keeping them safe. On occasion, some utilities can get damaged. Have no fear — our installers are trained to call 811 right away to get the utility repaired or replaced as soon as possible. This will come at no expense to the owner. We cover any damage to utilities and are fully insured.' },
  { q: 'Will my lawn be okay?', a: 'Yes, we can preserve the integrity of your lawn. We use techniques designed to restore the appearance and functionality of your lawn during installation. Be sure to ask about this during your consultation to ensure your lawn meets the criteria.' },
  { q: 'How long will my drainage system last?', a: 'We only use the highest quality materials. Our ADS piping has a rated lifetime of 100 years. It’s likely your drainage system will outlive your home. To ensure you get the longest life and greatest functionality from your system, schedule an annual hydrojet cleanout.' },
  { q: 'How do I maintain my drainage system?', a: `Our drainage systems are designed to be inherently low maintenance. However, a little maintenance goes a long way. All installations come with a <a class="inline-link" href="${CARE_GUIDE_URL}" download>Care Guide</a> that will instruct you on how to care for your system.` },
]

export const HOURS = [
  ['Monday', '7:00 AM – 5:00 PM'],
  ['Tuesday', '7:00 AM – 5:00 PM'],
  ['Wednesday', '7:00 AM – 5:00 PM'],
  ['Thursday', '7:00 AM – 5:00 PM'],
  ['Friday', '7:00 AM – 5:00 PM'],
  ['Saturday', 'By appointment'],
  ['Sunday', 'Closed'],
]

export const PROCESS_STEPS = [
  { n: '01', title: 'Free On-Site Estimate', text: 'We walk the property, find where the water is actually coming from, and talk through the options with you face to face.' },
  { n: '02', title: 'Custom System Design', text: 'We design a system sized for your soil, slope and water volume — then handle any permits the city requires.' },
  { n: '03', title: 'One-Day Installation', text: 'Most residential installations are completed in a single business day, with your lawn restored before we leave.' },
  { n: '04', title: 'Care Guide & Support', text: `You get a <a class="inline-link" href="${CARE_GUIDE_URL}" download>Care Guide</a> for your system, and a team that answers the phone afterwards.` },
]
