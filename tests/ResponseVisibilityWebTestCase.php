<?php

namespace Capco\Tests;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\UserBundle\Entity\User;

abstract class ResponseVisibilityWebTestCase extends IdentityWebTestCase
{
    protected function contribution(string $type, User $author): Proposal|Reply
    {
        if ('Proposal' === $type) {
            $form = $this->em->getRepository(ProposalForm::class)->findOneBy([]);
            $contribution = (new Proposal())->setAuthor($author)->setProposalForm($form)->setTitle('Response visibility')->setBody('Public content')->setDraft(false)->setPublishedAt(new \DateTime('2020-01-01'));
        } else {
            $form = $this->em->getRepository(Questionnaire::class)->findOneBy([]);
            $contribution = (new Reply())->setAuthor($author)->setQuestionnaire($form)->setDraft(false)->setPublishedAt(new \DateTime('2020-01-01'));
        }
        $this->em->persist($contribution);
        foreach (['public' => [false, false], 'private' => [true, false], 'hidden' => [false, true]] as $label => [$private, $hidden]) {
            $question = (new SimpleQuestion())->setTitle('Visibility ' . $label)->setType('text')->setPrivate($private)->setHidden($hidden)->setRequired(false);
            $association = (new QuestionnaireAbstractQuestion())->setQuestion($question)->setPosition(100 + \count($form->getQuestions()));
            if ($form instanceof ProposalForm) {
                $association->setProposalForm($form);
            } else {
                $association->setQuestionnaire($form);
            }
            $form->addQuestion($association);
            $response = (new ValueResponse())->setUser($author)->setQuestion($question)->setValue('Answer ' . $label);
            if ($contribution instanceof Proposal) {
                $response->setProposal($contribution);
            } else {
                $response->setReply($contribution);
            }
            $this->em->persist($association);
            $this->em->persist($response);
        }
        $this->em->flush();

        return $contribution;
    }

    /** @param list<string> $expected */
    protected function assertVisibleResponses(string $type, string $id, array $expected): void
    {
        $result = $this->graphql('query($id: ID!) { node(id: $id) { ... on ' . $type . ' { responses { question { title } ... on ValueResponse { value } } } } }', ['id' => \Overblog\GraphQLBundle\Relay\Node\GlobalId::toGlobalId($type, $id)]);
        self::assertNotNull($result['node']);
        $visible = [];
        foreach ($result['node']['responses'] as $response) {
            if (str_starts_with((string) $response['question']['title'], 'Visibility ')) {
                $visible[] = $response['value'];
            }
        }
        self::assertSame($expected, $visible);
    }
}
