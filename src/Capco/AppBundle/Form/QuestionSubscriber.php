<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use pmill\Doctrine\Hydrator\ArrayHydrator;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;

class QuestionSubscriber implements EventSubscriberInterface
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
        return [
            FormEvents::PRE_SET_DATA => 'preSetData',
            FormEvents::PRE_SUBMIT => 'preSubmit',
        ];
    }

    public function preSetData(FormEvent $event)
    {
        if (!$data = $event->getData()) {
            return;
        }

        $form = $event->getForm();
        $question = $data->getQuestion();
        $this->addQuestionToForm($question, $form);
    }

    public function preSubmit(FormEvent $event)
    {
        // if data has an id, it is considered as a update, so we can skip
        if ((!$data = $event->getData()) || !is_array($data) || isset($data['question']['id'])) {
            return;
        }

        // because of abstract inheritance, we need to handle creation and mapping to Doctrine.
        $form = $event->getForm();

        if (AbstractQuestion::QUESTION_TYPE_MEDIAS === $data['question']['type']) {
            $question = new MediaQuestion();
        } else {
            $question = new SimpleQuestion();
        }

        // We hydrate the question with submitted values
        $question = $this->arrayHydrator->hydrate($question, $data['question']);

        // Hotfix for missing qaq
        $qaq = new QuestionnaireAbstractQuestion();
        $qaq->setPosition($data['position']);
        $proposalForm = $form->getRoot()->getData();
        $qaq->setProposalForm($proposalForm);
        $question->setQuestionnaireAbstractQuestion($qaq);

        $this->addQuestionToForm($question, $form);

        // We are creating so we don't need an id field
        $form->get('question')->remove('id');
    }

    private function getFormType(AbstractQuestion $question): string
    {
        if ($question instanceof SimpleQuestion) {
            return SimpleQuestionType::class;
        }

        return MediaQuestionType::class;
    }

    private function addQuestionToForm(AbstractQuestion $data, FormInterface $form)
    {
        $formElement = $this->factory->createNamed('question', $this->getFormType($data), $data, ['auto_initialize' => false]);
        $form->add($formElement);
    }
}
