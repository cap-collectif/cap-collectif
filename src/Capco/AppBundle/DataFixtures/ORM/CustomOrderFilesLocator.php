<?php

declare(strict_types=1);

namespace Capco\AppBundle\DataFixtures\ORM;

use Hautelook\AliceBundle\FixtureLocatorInterface;
use Nelmio\Alice\IsAServiceTrait;

final class CustomOrderFilesLocator implements FixtureLocatorInterface
{
    use IsAServiceTrait;

    private $decoratedFixtureLocator;
    private $fixturesDir;

    private $step = 0;

    public function __construct(FixtureLocatorInterface $decoratedFixtureLocator, $fixturesDir)
    {
        $this->decoratedFixtureLocator = $decoratedFixtureLocator;
        $this->fixturesDir = $fixturesDir;
    }

    /**
     * Re-order the files found by the decorated finder.
     *
     * {@inheritdoc}
     */
    public function locateFiles(array $bundles, string $environment): array
    {
        if ('prod' === $environment) {
            return $this->installProdFixtures();
        }
        if ('benchmark' === $environment) {
            return $this->installBenchmarkFixtures();
        }

        return $this->installDevFixtures();
    }

    private function installBenchmarkFixtures(): array
    {
        return [
            $this->fixturesDir . 'Benchmark/UserType.yaml',
            $this->fixturesDir . 'Benchmark/MapToken.yaml',
            $this->fixturesDir . 'Benchmark/User.yaml',
            $this->fixturesDir . 'Benchmark/Locale.yaml',
            $this->fixturesDir . 'Benchmark/MenuItem.yaml',
            $this->fixturesDir . 'Benchmark/FooterSocialNetwork.yaml',
            $this->fixturesDir . 'Benchmark/Theme.yaml',
            $this->fixturesDir . 'Benchmark/OpinionType.yaml',
            $this->fixturesDir . 'Benchmark/Project.yaml',
            $this->fixturesDir . 'Benchmark/ConsultationStep.yaml',
            $this->fixturesDir . 'Benchmark/Consultation.yaml',
            $this->fixturesDir . 'Benchmark/CollectStep.yaml',
            $this->fixturesDir . 'Benchmark/SelectionStep.yaml',
            $this->fixturesDir . 'Benchmark/SiteParameter.yaml',
            $this->fixturesDir . 'Benchmark/SiteColor.yaml',
            $this->fixturesDir . 'Benchmark/SiteImage.yaml',
            $this->fixturesDir . 'Benchmark/QuestionnaireStep.yaml',
            $this->fixturesDir . 'Benchmark/ProjectAbstractStep.yaml',
            $this->fixturesDir . 'Benchmark/Opinion.yaml',
            $this->fixturesDir . 'Benchmark/Category.yaml',
            $this->fixturesDir . 'Benchmark/Source.yaml',
            $this->fixturesDir . 'Benchmark/Argument.yaml',
            $this->fixturesDir . 'Benchmark/ProposalForm.yaml',
            $this->fixturesDir . 'Benchmark/ProposalFormNotificationConfiguration.yaml',
            $this->fixturesDir . 'Benchmark/ProposalDistrict.yaml',
            $this->fixturesDir . 'Benchmark/Questionnaire.yaml',
            $this->fixturesDir . 'Benchmark/QuestionChoice.yaml',
            $this->fixturesDir . 'Benchmark/MultipleChoiceQuestion.yaml',
            $this->fixturesDir . 'Benchmark/QuestionnaireAbstractQuestion.yaml',
            $this->fixturesDir . 'Benchmark/QuestionChoice.yaml',
            $this->fixturesDir . 'Benchmark/ProposalCategory.yaml',
            $this->fixturesDir . 'Benchmark/Status.yaml',
            $this->fixturesDir . 'Benchmark/Proposal.yaml',
            $this->fixturesDir . 'Benchmark/Reply.yaml',
            $this->fixturesDir . 'Benchmark/Post.yaml',
            $this->fixturesDir . 'Benchmark/ProposalCollectVote.yaml',
            $this->fixturesDir . 'Benchmark/ProposalComment.yaml',
            $this->fixturesDir . 'Benchmark/CommentVote.yaml',
            $this->fixturesDir . 'Benchmark/Follower.yaml',
            $this->fixturesDir . 'Benchmark/HighlightedContent.yaml',
            $this->fixturesDir . 'Benchmark/Event.yaml'
        ];
    }

    private function installProdFixtures(): array
    {
        return [
            $this->fixturesDir . 'Prod/MediaContext.yaml',
            $this->fixturesDir . 'Prod/MediaCategory.yaml',
            $this->fixturesDir . 'Prod/Locale.yaml',
            $this->fixturesDir . 'Prod/ContactForm.yaml',
            $this->fixturesDir . 'Prod/RegistrationForm.yaml',
            $this->fixturesDir . 'Prod/Media.yaml',
            $this->fixturesDir . 'Prod/CategoryImage.yaml',
            $this->fixturesDir . 'Prod/UserType.yaml',
            $this->fixturesDir . 'Prod/User.yaml',
            $this->fixturesDir . 'Prod/MenuItem.yaml',
            $this->fixturesDir . 'Prod/SiteParameter.yaml',
            $this->fixturesDir . 'Prod/SocialNetwork.yaml',
            $this->fixturesDir . 'Prod/FooterSocialNetwork.yaml',
            $this->fixturesDir . 'Prod/Page.yaml',
            $this->fixturesDir . 'Prod/Category.yaml',
            $this->fixturesDir . 'Prod/SiteImage.yaml',
            $this->fixturesDir . 'Prod/SiteColor.yaml',
            $this->fixturesDir . 'Prod/Section.yaml',
            $this->fixturesDir . 'Prod/PresentationStep.yaml',
            $this->fixturesDir . 'Prod/OtherStep.yaml',
            $this->fixturesDir . 'Prod/ProjectAbstractStep.yaml',
            $this->fixturesDir . 'Prod/ProjectType.yaml',
            $this->fixturesDir . 'Prod/Project.yaml',
            $this->fixturesDir . 'Prod/ProjectAuthor.yaml',
            $this->fixturesDir . 'Prod/Post.yaml',
            $this->fixturesDir . 'Prod/PostTranslation.yaml',
            $this->fixturesDir . 'Prod/Event.yaml',
            $this->fixturesDir . 'Prod/HighlightedContent.yaml',
            $this->fixturesDir . 'Prod/FranceConnectSSOConfiguration.yaml'
        ];
    }

    private function installDevFixtures(): array
    {
        return [
            $this->fixturesDir . 'Dev/MediaContext.yaml',
            $this->fixturesDir . 'Dev/MediaCategory.yaml',
            $this->fixturesDir . 'Dev/Media.yaml',
            $this->fixturesDir . 'Dev/Locale.yaml',
            $this->fixturesDir . 'Dev/CategoryImage.yaml',
            $this->fixturesDir . 'Dev/RegistrationForm.yaml',
            $this->fixturesDir . 'Dev/Group.yaml',
            $this->fixturesDir . 'Dev/EmailDomain.yaml',
            $this->fixturesDir . 'Dev/UserNotificationsConfiguration.yaml',
            $this->fixturesDir . 'Dev/UserType.yaml',
            $this->fixturesDir . 'Dev/User.yaml',
            $this->fixturesDir . 'Dev/UserArchive.yaml',
            $this->fixturesDir . 'Dev/Page.yaml',
            $this->fixturesDir . 'Dev/PageTranslation.yaml',
            $this->fixturesDir . 'Dev/MenuItem.yaml',
            $this->fixturesDir . 'Dev/SiteParameter.yaml',
            $this->fixturesDir . 'Dev/SiteImage.yaml',
            $this->fixturesDir . 'Dev/SiteColor.yaml',
            $this->fixturesDir . 'Dev/NewsletterSubscription.yaml',
            $this->fixturesDir . 'Dev/SocialNetwork.yaml',
            $this->fixturesDir . 'Dev/FooterSocialNetwork.yaml',
            $this->fixturesDir . 'Dev/Theme.yaml',
            $this->fixturesDir . 'Dev/ThemeTranslation.yaml',
            $this->fixturesDir . 'Dev/ConsultationStep.yaml',
            $this->fixturesDir . 'Dev/Consultation.yaml',
            $this->fixturesDir . 'Dev/OpinionType.yaml',
            $this->fixturesDir . 'Dev/AppendixType.yaml',
            $this->fixturesDir . 'Dev/OpinionTypeAppendixType.yaml',
            $this->fixturesDir . 'Dev/ProjectType.yaml',
            $this->fixturesDir . 'Dev/Project.yaml',
            $this->fixturesDir . 'Dev/ProjectAuthor.yaml',
            $this->fixturesDir . 'Dev/ProjectDistrict.yaml',
            $this->fixturesDir . 'Dev/PresentationStep.yaml',
            $this->fixturesDir . 'Dev/RankingStep.yaml',
            $this->fixturesDir . 'Dev/OtherStep.yaml',
            $this->fixturesDir . 'Dev/Synthesis.yaml',
            $this->fixturesDir . 'Dev/SynthesisStep.yaml',
            $this->fixturesDir . 'Dev/CollectStep.yaml',
            $this->fixturesDir . 'Dev/SelectionStep.yaml',
            $this->fixturesDir . 'Dev/Requirement.yaml',
            $this->fixturesDir . 'Dev/UserRequirement.yaml',
            $this->fixturesDir . 'Dev/QuestionnaireStep.yaml',
            $this->fixturesDir . 'Dev/ProjectAbstractStep.yaml',
            $this->fixturesDir . 'Dev/Answer.yaml',
            $this->fixturesDir . 'Dev/Opinion.yaml',
            $this->fixturesDir . 'Dev/OpinionAppendix.yaml',
            $this->fixturesDir . 'Dev/OpinionVote.yaml',
            $this->fixturesDir . 'Dev/OpinionVersion.yaml',
            $this->fixturesDir . 'Dev/OpinionVersionVote.yaml',
            $this->fixturesDir . 'Dev/Category.yaml',
            $this->fixturesDir . 'Dev/Source.yaml',
            $this->fixturesDir . 'Dev/SourceVote.yaml',
            $this->fixturesDir . 'Dev/Argument.yaml',
            $this->fixturesDir . 'Dev/ArgumentVote.yaml',
            $this->fixturesDir . 'Dev/Questionnaire.yaml',
            $this->fixturesDir . 'Dev/ProposalForm.yaml',
            $this->fixturesDir . 'Dev/ProposalFormNotificationConfiguration.yaml',
            $this->fixturesDir . 'Dev/ProposalCategory.yaml',
            $this->fixturesDir . 'Dev/Status.yaml',
            $this->fixturesDir . 'Dev/SectionQuestion.yaml',
            $this->fixturesDir . 'Dev/QuestionChoice.yaml',
            $this->fixturesDir . 'Dev/SimpleQuestion.yaml',
            $this->fixturesDir . 'Dev/MediaQuestion.yaml',
            $this->fixturesDir . 'Dev/MultipleChoiceQuestion.yaml',
            $this->fixturesDir . 'Dev/QuestionnaireAbstractQuestion.yaml',
            $this->fixturesDir . 'Dev/BackgroundStyle.yaml',
            $this->fixturesDir . 'Dev/BorderStyle.yaml',
            $this->fixturesDir . 'Dev/ProposalDistrict.yaml',
            $this->fixturesDir . 'Dev/Proposal.yaml',
            $this->fixturesDir . 'Dev/Selection.yaml',
            $this->fixturesDir . 'Dev/Reply.yaml',
            $this->fixturesDir . 'Dev/ProposalEvaluation.yaml',
            $this->fixturesDir . 'Dev/ValueResponse.yaml',
            $this->fixturesDir . 'Dev/MediaResponse.yaml',
            $this->fixturesDir . 'Dev/ProgressStep.yaml',
            $this->fixturesDir . 'Dev/ProposalSelectionVote.yaml',
            $this->fixturesDir . 'Dev/ProposalCollectVote.yaml',
            $this->fixturesDir . 'Dev/ProposalComment.yaml',
            $this->fixturesDir . 'Dev/Post.yaml',
            $this->fixturesDir . 'Dev/PostTranslation.yaml',
            $this->fixturesDir . 'Dev/PostComment.yaml',
            $this->fixturesDir . 'Dev/EventReview.yaml',
            $this->fixturesDir . 'Dev/Event.yaml',
            $this->fixturesDir . 'Dev/EventRegistration.yaml',
            $this->fixturesDir . 'Dev/EventComment.yaml',
            $this->fixturesDir . 'Dev/CommentVote.yaml',
            $this->fixturesDir . 'Dev/Video.yaml',
            $this->fixturesDir . 'Dev/Section.yaml',
            $this->fixturesDir . 'Dev/HighlightedContent.yaml',
            $this->fixturesDir . 'Dev/UserGroup.yaml',
            $this->fixturesDir . 'Dev/Follower.yaml',
            $this->fixturesDir . 'Dev/Reporting.yaml',
            $this->fixturesDir . 'Dev/MultipleChoiceQuestionLogicJumpCondition.yaml',
            $this->fixturesDir . 'Dev/LogicJump.yaml',
            $this->fixturesDir . 'Dev/SectionQuestion.yaml',
            $this->fixturesDir . 'Dev/PublicApiToken.yaml',
            $this->fixturesDir . 'Dev/MapToken.yaml',
            $this->fixturesDir . 'Dev/ContactForm.yaml',
            $this->fixturesDir . 'Dev/FranceConnectSSOConfiguration.yaml',
            $this->fixturesDir . 'Dev/Oauth2SSOConfiguration.yaml',
            $this->fixturesDir . 'Dev/UserConnection.yaml',
            $this->fixturesDir . 'Dev/ProjectDistrictPositioner.yaml'
        ];
    }
}
