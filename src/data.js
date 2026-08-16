// Central content data for the site generator (scripts/build.js).

export const SITE = {
  name: 'Rain Drains LLC',
  domain: 'https://raindrainsva.com',
  phone: '757-807-0080',
  phoneTel: '+17578070080',
  email: 'bryson@raindrainsva.com',
  addressLocality: 'Chesapeake',
  addressRegion: 'VA',
  postalCode: '23322',
  license: 'VA Lic. 2705193711',
  rating: 5.0,
  reviewCount: 105,
  year: 2026,
}

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
    body: [
      'A soggy lawn, muddy paws, and standing water against your foundation aren’t just frustrating — they’re active threats to your home’s structural integrity. Across the Hampton Roads region and northeastern North Carolina, our unique coastal climate, heavy seasonal downpours, and challenging soil types make proper subsurface water management absolutely critical.',
      'If you have areas of your yard that stay wet for days after a storm, a custom-engineered French drain system is the most reliable, permanent solution to redirect groundwater safely off your property.',
    ],
    bullets: ['Custom-sized for your soil and water volume', 'NDS-rated piping, 100-year lifespan', 'Lawn restored after installation'],
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
    short: 'Standing water, soggy lawns and water against the foundation — solved permanently.',
    icon: 'home',
    body: [
      'Standing water in the yard, a soggy lawn that never dries out, or water pooling against your foundation are all signs your property needs a properly engineered drainage system, not just a patch job.',
      'We walk every residential property in person, identify where the water is actually coming from, and design a system — French drains, grading, downspout tie-ins, or a combination — that solves the root cause.',
      'Most residential drainage installations are completed and cleaned up in a single business day.',
    ],
    bullets: ['Free on-site evaluation', 'Systems designed for your specific yard', 'Most jobs completed in one day'],
  },
  {
    slug: 'commercial-drainage',
    name: 'Commercial Drainage',
    short: 'Parking lots, apartment complexes, office and retail sites kept dry, safe and compliant.',
    icon: 'building',
    body: [
      'Standing water on commercial property is a liability, safety and compliance issue, not just an inconvenience. We design and install drainage systems for parking lots, apartment complexes, retail centers and office parks across Hampton Roads.',
      'Our team handles the permitting, works around your operating hours, and builds systems sized for large impervious surfaces and heavy storm flow.',
      'We work with property managers, GCs and HOAs to keep tenants, customers and insurers happy.',
    ],
    bullets: ['Scoped for property managers, HOAs & GCs', 'Permits handled for you', 'Scheduled around business operations', 'Fully insured crews'],
  },
  {
    slug: 'downspout-extensions-1',
    name: 'Downspout Extensions',
    short: 'Route roof runoff safely away from your foundation, siding and pool concrete.',
    icon: 'downspout',
    body: [
      'An improperly discharging downspout is one of the most common causes of foundation erosion, cracked concrete and washed-out landscaping — it’s actually how Rain Drains got started.',
      'We tie your downspouts into buried, solid-pipe extensions that carry roof runoff well away from your home and discharge it at a safe, code-compliant point on your property.',
      'A simple fix that prevents a lot of expensive damage down the line.',
    ],
    bullets: ['Buried, solid-pipe extensions', 'Protects foundations, siding & concrete', 'Ties into existing gutters', 'Clean, mulched-over finish'],
  },
  {
    slug: 'concrete-drains-1',
    name: 'Concrete Drains',
    short: 'Trench drains and channel systems cut into driveways, patios and walkways.',
    icon: 'trench',
    body: [
      'Concrete driveways, patios and walkways can trap and pool water if they weren’t graded or drained correctly when they were poured. We cut in channel and trench drains that capture that water at the surface and carry it away.',
      'Every concrete drain is tied into the rest of your drainage system so water is moved off the property, not just off the slab.',
    ],
    bullets: ['Channel & trench drain installation', 'Ties into full-property drainage', 'Clean concrete cuts and finishing', 'Grates rated for foot & vehicle traffic'],
  },
  {
    slug: 'grading-services',
    name: 'Grading Services',
    short: 'Re-slope your yard so water moves away from your home instead of pooling against it.',
    icon: 'grade',
    body: [
      'Sometimes the fix isn’t more pipe — it’s getting the slope of your yard right in the first place. We regrade lawns, beds and drainage swales so water flows away from your foundation by gravity.',
      'Grading is often combined with a French drain or downspout system for a complete, long-term solution.',
    ],
    bullets: ['Corrects negative slope toward the home', 'Often paired with French drains', 'Restores lawn after grading', 'Prevents erosion and pooling'],
  },
  {
    slug: 'outdoor-sump-pumps-1',
    name: 'Outdoor Sump Pumps',
    short: 'Powered pumping for low spots that gravity drainage alone can’t solve.',
    icon: 'pump',
    body: [
      'Some yards sit too low, or too flat, for a gravity-fed drain to keep up. In those cases we install an outdoor sump pump system — a buried basin and pump that actively moves water uphill or over long distances to a safe discharge point.',
      'We size the pump and basin for your property’s worst-case rainfall, not just an average storm.',
    ],
    bullets: ['For low or flat yards gravity can’t drain', 'Sized for worst-case rainfall', 'Buried basin, discreet discharge line'],
  },
  {
    slug: 'exterior-waterproofing',
    name: 'Exterior Waterproofing',
    short: 'Keep water from reaching your foundation walls in the first place.',
    icon: 'shield',
    body: [
      'Exterior waterproofing works alongside drainage to keep moisture from reaching your foundation walls at all — sealing, membranes and drainage board applied below grade, paired with a French drain to carry away anything that does get through.',
      'It’s the most effective long-term defense against basement and crawlspace moisture.',
    ],
    bullets: ['Below-grade sealing & membranes', 'Paired with French drain systems', 'Reduces basement & crawlspace moisture', 'Protects foundation walls long-term'],
  },
  {
    slug: 'culvert-pipe-installation-1',
    name: 'Culvert Pipe Installation',
    short: 'Move water safely under driveways, roads and access points.',
    icon: 'pipe',
    body: [
      'Culvert pipes carry ditch and stormwater safely underneath driveways, private roads and property access points, keeping the flow of water moving instead of damming it up against your drive.',
      'We size and install culverts to code, including any permitting required by your county or city.',
    ],
    bullets: ['Sized to handle ditch & storm flow', 'Permits researched and obtained', 'Prevents driveway washouts', 'Durable, code-compliant pipe'],
  },
  {
    slug: 'gravel-driveways',
    name: 'Gravel Driveways',
    short: 'Properly graded and drained gravel driveways that hold up to Hampton Roads weather.',
    icon: 'gravel',
    body: [
      'A gravel driveway is only as good as the drainage underneath it. We grade, base and install gravel driveways so water sheds off the surface instead of turning it into ruts and mud.',
      'Great as a standalone project or paired with drainage work already underway on your property.',
    ],
    bullets: ['Proper base & grading', 'Sheds water instead of pooling', 'Durable in Hampton Roads clay soil', 'Can be paired with drainage work'],
  },
  {
    slug: 'trenching-service',
    name: 'Trenching Service',
    short: 'Clean, precise trenching for drainage, utilities and irrigation lines.',
    icon: 'dig',
    body: [
      'We offer standalone trenching for drainage, irrigation and utility lines — dug to depth and spec, with 811 utility locates called in before we ever break ground.',
      'Backfilled and the surface restored once your lines are in.',
    ],
    bullets: ['811 utility locates called first', 'Dug to your specified depth & width', 'Backfilled and surface restored', 'For drainage, irrigation & utility lines'],
  },
  {
    slug: 'landscape-excavation',
    name: 'Landscape Excavation',
    short: 'Site prep and excavation for landscaping, patios and drainage projects.',
    icon: 'excavate',
    body: [
      'From clearing and grubbing to cutting in a new patio base or retaining wall footing, we handle the excavation work that has to happen before the landscaping or drainage project can begin.',
      'Right-sized equipment for residential lots, so we get the work done without tearing up the rest of your yard.',
    ],
    bullets: ['Site prep for landscaping & hardscape', 'Right-sized equipment for residential lots', 'Debris & spoil hauled off', 'Paired with grading & drainage'],
  },
  {
    slug: 'pool-liner-protection-1',
    name: 'Pool Liner Protection',
    short: 'Protect pool decks, liners and surrounds from hydrostatic pressure and runoff damage.',
    icon: 'pool',
    body: [
      'Water pressure building up behind a pool wall or under a liner — hydrostatic pressure — can push, float or tear a liner and crack surrounding concrete. We install drainage systems specifically designed to relieve that pressure and route runoff away from the pool entirely.',
      'A downspout washing out onto pool concrete is exactly the problem that led Bryson to start Rain Drains in the first place.',
    ],
    bullets: ['Relieves hydrostatic pressure', 'Protects liners & surrounding concrete', 'Routes downspout runoff away from the pool', 'Prevents costly liner failures'],
  },
  {
    slug: 'hydrojet-cleanout-1',
    name: 'Hydrojet Cleanout',
    short: 'High-pressure jetting to clear roots, silt and debris from existing drainage lines.',
    icon: 'jet',
    body: [
      'Even a well-built drainage system needs the occasional cleanout. Our hydrojet service blasts silt, roots and debris out of existing drain lines with high-pressure water, restoring full flow without digging anything up.',
      'We recommend an annual hydrojet cleanout to get the longest life and best performance out of your system.',
    ],
    bullets: ['Clears roots, silt & debris', 'No digging required', 'Recommended annually', 'Extends the life of your system'],
  },
]

export const AREAS = [
  { slug: 'virginia-beach', name: 'Virginia Beach', state: 'VA' },
  { slug: 'chesapeake', name: 'Chesapeake', state: 'VA' },
  { slug: 'norfolk', name: 'Norfolk', state: 'VA' },
  { slug: 'portsmouth', name: 'Portsmouth', state: 'VA' },
  { slug: 'suffolk', name: 'Suffolk', state: 'VA' },
  { slug: 'hampton', name: 'Hampton', state: 'VA' },
  { slug: 'newport-news', name: 'Newport News', state: 'VA' },
  { slug: 'smithfield', name: 'Smithfield', state: 'VA' },
  { slug: 'carrolton', name: 'Carrollton', state: 'VA' },
  { slug: 'currituck-county', name: 'Currituck County', state: 'NC' },
  { slug: 'camden-county', name: 'Camden County', state: 'NC' },
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
  { q: 'How long will my drainage system last?', a: 'We only use the highest quality materials. Our NDS piping has a rated lifetime of 100 years. It’s likely your drainage system will outlive your home. To ensure you get the longest life and greatest functionality from your system, schedule an annual hydrojet cleanout.' },
  { q: 'How do I maintain my drainage system?', a: 'Our drainage systems are designed to be inherently low maintenance. However, a little maintenance goes a long way. All installations come with a Care Guide that will instruct you on how to care for your system.' },
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
  { n: '04', title: 'Care Guide & Support', text: 'You get a Care Guide for your system, and a team that answers the phone afterwards.' },
]
