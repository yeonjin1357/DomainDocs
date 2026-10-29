import Analogy from './Analogy.astro';
import Check from './Check.astro';
import Checkpoints from './Checkpoints.astro';
import Deeper from './Deeper.astro';
import Figure from './Figure.astro';
import FirstLook from './FirstLook.astro';
import Item from './Item.astro';
import KeyPoints from './KeyPoints.astro';
import OnDashboard from './OnDashboard.astro';
import Point from './Point.astro';
import Situation from './Situation.astro';
import Term from './Term.astro';
import MiniLineChart from '../viz/MiniLineChart.astro';
import StatTile from '../viz/StatTile.astro';
import Waterfall from '../viz/Waterfall.astro';
import Scatter from '../viz/Scatter.astro';
import ServiceMap from '../viz/ServiceMap.astro';
import Flow from '../viz/Flow.astro';
import Sequence from '../viz/Sequence.astro';
import Layers from '../viz/Layers.astro';
import Compare from '../viz/Compare.astro';
import Timeline from '../viz/Timeline.astro';
import Strip from '../viz/Strip.astro';

/** MDX에서 import 없이 쓰는 컴포넌트. React 데모는 여기 넣지 않는다(client 지시어를 쓸 수 없다). */
export const mdxComponents = { OnDashboard, KeyPoints, Point, Analogy, Figure, Checkpoints, Check, Deeper, Situation, FirstLook, Item, Term, MiniLineChart, StatTile, Waterfall, Scatter, ServiceMap, Flow, Sequence, Layers, Compare, Timeline, Strip };
