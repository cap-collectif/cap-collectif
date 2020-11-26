import {PolymorphicComponent} from '../Primitives/AppBox'
import Heading from '../Primitives/Heading'
import Text from '../Primitives/Text'

type Props = {
    readonly illustration?: string
    readonly publishedAt?: string
}

export declare const DebateArticleCardTitle: typeof Heading
export declare const DebateArticleCardDescription: typeof Text
export declare const DebateArticleCardOrigin: typeof Text
export declare const DebateArticleCard: PolymorphicComponent<Props> & {
    Title: typeof DebateArticleCardTitle,
    Description: typeof DebateArticleCardDescription,
    Origin: typeof DebateArticleCardOrigin,
}

export default DebateArticleCard
