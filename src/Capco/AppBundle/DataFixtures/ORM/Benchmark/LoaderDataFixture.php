<?php

namespace Capco\AppBundle\DataFixtures\ORM\Benchmark;

use Hautelook\AliceBundle\Doctrine\DataFixtures\AbstractLoader;

class LoaderDataFixture extends AbstractLoader
{
    public function getFixtures()
    {
        return [
            __DIR__ . '/UserType.yml',
            __DIR__ . '/User.yml',
            __DIR__ . '/MenuItem.yml',
            __DIR__ . '/FooterSocialNetwork.yml',
            __DIR__ . '/Theme.yml',
            __DIR__ . '/OpinionType.yml',
            __DIR__ . '/Project.yml',
            __DIR__ . '/ConsultationStep.yml',
            __DIR__ . '/ConsultationStepType.yml',
            __DIR__ . '/CollectStep.yml',
            __DIR__ . '/SelectionStep.yml',
            __DIR__ . '/SiteParameter.yml',
            __DIR__ . '/SiteColor.yml',
            __DIR__ . '/SiteImage.yml',
            __DIR__ . '/QuestionnaireStep.yml',
            __DIR__ . '/ProjectAbstractStep.yml',
            __DIR__ . '/Opinion.yml',
            __DIR__ . '/Category.yml',
            __DIR__ . '/Source.yml',
            __DIR__ . '/Argument.yml',
            __DIR__ . '/ProposalForm.yml',
            __DIR__ . '/ProposalFormNotificationConfiguration.yml',
            __DIR__ . '/ProposalDistrict.yml',
            __DIR__ . '/Questionnaire.yml',
            __DIR__ . '/QuestionChoice.yml',
            __DIR__ . '/MultipleChoiceQuestion.yml',
            __DIR__ . '/QuestionnaireAbstractQuestion.yml',
            __DIR__ . '/QuestionChoice.yml',
            __DIR__ . '/Proposal.yml',
            __DIR__ . '/Reply.yml',
            // __DIR__ . '/Post.yml',
            __DIR__ . '/ProposalCollectVote.yml',
            __DIR__ . '/ProposalComment.yml',
            __DIR__ . '/CommentVote.yml',
            __DIR__ . '/Follower.yml',
            __DIR__ . '/HighlightedContent.yml',
        ];
    }
}
