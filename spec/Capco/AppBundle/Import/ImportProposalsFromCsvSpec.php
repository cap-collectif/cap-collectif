<?php

namespace spec\Capco\AppBundle\Import;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Import\ImportProposalsFromCsv;
use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Repository\ProposalCategoryRepository;
use Capco\AppBundle\Repository\ProposalDistrictRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\StatusRepository;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Service\SocialNetworksUrlSanitizer;
use Capco\AppBundle\Utils\Map;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ImportProposalsFromCsvSpec extends ObjectBehavior
{
    public function let(
        MediaManager $mediaManager,
        ProposalDistrictRepository $districtRepository,
        ProposalCategoryRepository $proposalCategoryRepository,
        ProposalRepository $proposalRepository,
        StatusRepository $statusRepository,
        UserRepository $userRepository,
        Map $map,
        EntityManagerInterface $om,
        ThemeRepository $themeRepository,
        Indexer $indexer,
        LoggerInterface $logger,
        TokenGeneratorInterface $tokenGenerator,
        ValidatorInterface $validator,
        TranslatorInterface $translator,
        SocialNetworksUrlSanitizer $socialNetworksUrlSanitizer
    ) {
        $this->beConstructedWith(
            $mediaManager,
            $districtRepository,
            $proposalCategoryRepository,
            $proposalRepository,
            $statusRepository,
            $userRepository,
            $map,
            $om,
            $themeRepository,
            $indexer,
            $logger,
            $tokenGenerator,
            $validator,
            $translator,
            '/var/www/tmp',
            $socialNetworksUrlSanitizer
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(ImportProposalsFromCsv::class);
    }

    public function it_doesnt_allow_other_choice(
        ProposalForm $proposalForm,
        MultipleChoiceQuestion $question,
        QuestionChoice $goodChoice
    ) {
        $row = $this->intializeChoiceTest([], $proposalForm, $question, $goodChoice);
        $question->isOtherAllowed()->willReturn(false);

        $this->checkIfCustomQuestionResponseIsValid($row, 2)->shouldReturn(false);
    }

    public function it_allow_other_choice(
        ProposalForm $proposalForm,
        MultipleChoiceQuestion $question,
        QuestionChoice $goodChoice
    ) {
        $row = $this->intializeChoiceTest([], $proposalForm, $question, $goodChoice);
        $question->isOtherAllowed()->willReturn(true);

        $this->checkIfCustomQuestionResponseIsValid($row, 2)->shouldReturn(true);
    }

    public function it_allow_empty_choice(
        ProposalForm $proposalForm,
        MultipleChoiceQuestion $question,
        QuestionChoice $goodChoice
    ) {
        $customFields = ['question with bad choice'];
        $proposalForm->getQuestionByTitle('question with bad choice')->willReturn($question);
        $question->setTitle('question with bad choice');
        $goodChoice->setTitle('existing choice');
        $question->addChoice($goodChoice);
        // select
        $question->isRequired()->willReturn(false);
        $question->getType()->willReturn(4);
        $question->getChoices()->willReturn(new ArrayCollection([$goodChoice]));
        $question->isChoiceValid('')->willReturn(false);
        $row['question with bad choice'] = '';
        $this->setCustomFields($customFields);
        $this->setProposalForm($proposalForm);

        $proposalForm->getQuestions()->willReturn(new ArrayCollection([$question]));

        $this->checkIfCustomQuestionResponseIsValid($row, 2)->shouldReturn(true);
        $question->isRequired()->willReturn(true);
        $question->isOtherAllowed()->willReturn(false);
        $this->checkIfCustomQuestionResponseIsValid($row, 2)->shouldReturn(false);
        $question->isRequired()->willReturn(true);
        $question->isOtherAllowed()->willReturn(false);
        $this->checkIfCustomQuestionResponseIsValid($row, 2)->shouldReturn(false);
    }

    public function it_check_majority_question(ProposalForm $proposalForm, SimpleQuestion $question)
    {
        $customFields = ['majority decision'];
        $proposalForm->getQuestionByTitle('majority decision')->willReturn($question);
        $question->setTitle('majority decision');
        $question->getType()->willReturn(AbstractQuestion::QUESTION_TYPE_MAJORITY_DECISION);
        $row['majority decision'] = '';
        $this->setCustomFields($customFields);
        $this->setProposalForm($proposalForm);

        $proposalForm->getQuestions()->willReturn(new ArrayCollection([$question]));

        $this->checkIfCustomQuestionResponseIsValid($row, 2)->shouldReturn(true);
    }

    private function intializeChoiceTest(
        array $row,
        ProposalForm $proposalForm,
        AbstractQuestion $question,
        QuestionChoice $goodChoice
    ) {
        $customFields = ['question with bad choice'];
        $proposalForm->getQuestionByTitle('question with bad choice')->willReturn($question);
        $question->setTitle('question with bad choice');
        $goodChoice->setTitle('existing choice');
        $question->addChoice($goodChoice);
        // radio
        $question->isRequired()->willReturn(true);
        $question->getType()->willReturn(3);
        $question->getChoices()->willReturn(new ArrayCollection([$goodChoice]));
        $question->isChoiceValid('not existing choice')->willReturn(false);
        $row['question with bad choice'] = 'not existing choice';
        $this->setCustomFields($customFields);
        $this->setProposalForm($proposalForm);

        $proposalForm->getQuestions()->willReturn(new ArrayCollection([$question]));

        return $row;
    }
}
