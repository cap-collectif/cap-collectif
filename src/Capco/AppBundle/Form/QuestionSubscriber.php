<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
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
        $class = get_class($question);
        if (SimpleQuestion::class === $class) {
            $this->processQuestion($question, $form, SimpleQuestionType::class);
        } elseif (MediaQuestion::class === $class) {
            $this->processQuestion($question, $form, MediaQuestionType::class);
        }
    }

    public function preSubmit(FormEvent $event)
    {
        // if data doesn't have any id, it is considered as a creation.
        // because of abstract inheritance, we need to handle creation and mapping to Doctrine.
        if ((!$data = $event->getData()) || !is_array($data) || isset($data['question']['id'])) {
            return;
        }

        $form = $event->getForm();

        if (AbstractQuestion::QUESTION_TYPE_MEDIAS === $data['question']['type']) {
            $type = MediaQuestionType::class;
            $question = new MediaQuestion();
        } else {
            $type = SimpleQuestionType::class;
            $question = new SimpleQuestion();
        }

        $question = $this->arrayHydrator->hydrate($question, $data['question']);
        $this->processQuestion($question, $form, $type);
        $form->get('question')->remove('id');
    }

    private function processQuestion(AbstractQuestion $question, FormInterface $form, string $type)
    {
        $form->add($this->factory->createNamed('question', $type, $question, ['auto_initialize' => false]));
    }
}
