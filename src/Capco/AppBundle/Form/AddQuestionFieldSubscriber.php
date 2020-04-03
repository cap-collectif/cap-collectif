<?php
namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Questions\SectionQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use pmill\Doctrine\Hydrator\ArrayHydrator;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;

class AddQuestionFieldSubscriber implements EventSubscriberInterface
{
    protected $factory;
    protected $arrayHydrator;

    public function __construct(FormFactoryInterface $factory, ArrayHydrator $arrayHydrator)
    {
        $this->factory = $factory;
        $this->arrayHydrator = $arrayHydrator;
    }

    public static function getSubscribedEvents(): array
    {
        return [FormEvents::PRE_SET_DATA => 'preSetData', FormEvents::PRE_SUBMIT => 'preSubmit'];
    }

    public function preSetData(FormEvent $event)
    {
        if (!($data = $event->getData())) {
            return;
        }
        $form = $event->getForm();
        $question = $data->getQuestion();
        $this->addQuestionToForm($question, $form);
    }

    public function preSubmit(FormEvent $event)
    {
        // if data has an id, it is considered as a update, so we can skip
        if (!($data = $event->getData()) || !\is_array($data) || isset($data['question']['id'])) {
            return;
        }
        // because of abstract inheritance, we need to handle creation and mapping to Doctrine.
        $form = $event->getForm();
        $question = null;

        if (AbstractQuestion::QUESTION_TYPE_MEDIAS === $data['question']['type']) {
            $question = new MediaQuestion();
        } elseif (
            AbstractQuestion::QUESTION_TYPE_SIMPLE_TEXT === $data['question']['type'] ||
            AbstractQuestion::QUESTION_TYPE_MULTILINE_TEXT === $data['question']['type'] ||
            AbstractQuestion::QUESTION_TYPE_EDITOR === $data['question']['type'] ||
            AbstractQuestion::QUESTION_TYPE_NUMBER === $data['question']['type'] ||
            AbstractQuestion::QUESTION_TYPE_SIRET === $data['question']['type'] ||
            AbstractQuestion::QUESTION_TYPE_RNA === $data['question']['type']
        ) {
            $question = new SimpleQuestion();
        } elseif (AbstractQuestion::QUESTION_TYPE_SECTION === $data['question']['type']) {
            $question = new SectionQuestion();
        } elseif (
            AbstractQuestion::QUESTION_TYPE_RADIO === $data['question']['type'] ||
            AbstractQuestion::QUESTION_TYPE_SELECT === $data['question']['type'] ||
            AbstractQuestion::QUESTION_TYPE_CHECKBOX === $data['question']['type'] ||
            AbstractQuestion::QUESTION_TYPE_RANKING === $data['question']['type'] ||
            AbstractQuestion::QUESTION_TYPE_BUTTON === $data['question']['type']
        ) {
            $question = new MultipleChoiceQuestion();
        }

        if (!$question) {
            throw new \RuntimeException(__METHOD__ . 'Could not guess your question type.');
        }

        // We hydrate the question with submitted values
        $question = $this->arrayHydrator->hydrate($question, $data['question']);

        $this->addQuestionToForm($question, $form);

        // We are creating so we don't need an id field
        $form->get('question')->remove('id');
    }

    private function getFormType(AbstractQuestion $question): string
    {
        if ($question instanceof SimpleQuestion) {
            return SimpleQuestionType::class;
        }
        if ($question instanceof MultipleChoiceQuestion) {
            return MultipleChoiceQuestionType::class;
        }

        if ($question instanceof SectionQuestion) {
            return SectionQuestionType::class;
        }

        return MediaQuestionType::class;
    }

    private function addQuestionToForm(AbstractQuestion $data, FormInterface $form)
    {
        $formElement = $this->factory->createNamed('question', $this->getFormType($data), $data, [
            'auto_initialize' => false,
        ]);

        $form->add($formElement);
    }
}
