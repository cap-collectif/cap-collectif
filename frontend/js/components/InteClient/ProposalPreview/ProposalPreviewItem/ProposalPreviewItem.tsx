// @ts-nocheck
import * as React from 'react'
import type { Colors } from './ProposalPreviewItem.style'
import { Container, Header, Footer } from './ProposalPreviewItem.style'
import Image from '~ui/Primitives/Image'

export type Props = {
  content: Record<string, string>
  author: string
  job: Record<string, string>
  img: string
  buttonLabel: Record<string, string>
  link?: Record<string, string>
  lang: string
  colors: Colors
}

const ProposalPreviewItem = ({ content, author, job, img, buttonLabel, colors, link, lang }: Props) => (
  <Container>
    <Header btnColor={colors.button}>
      <div className="avatar-wrapper">
        <Image src={img} alt="" />
      </div>
      {link && link[lang] && <a href={link[lang]}>{buttonLabel[lang]}</a>}
    </Header>

    <p className="proposal-content">{content[lang]}</p>

    <Footer authorColor={colors.name}>
      <p className="author">{author}</p>
      <p className="job">{job[lang]}</p>
    </Footer>
  </Container>
)

export default ProposalPreviewItem
