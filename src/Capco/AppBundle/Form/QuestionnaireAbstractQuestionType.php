<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use pmill\Doctrine\Hydrator\ArrayHydrator;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class QuestionnaireAbstractQuestionType extends AbstractType
{
    protected $arrayHydrator;

    public function __construct(ArrayHydrator $arrayHydrator)
    {
        $this->arrayHydrator = $arrayHydrator;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->addEventSubscriber(
            new AddQuestionFieldSubscriber($builder->getFormFactory(), $this->arrayHydrator)
        );
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => QuestionnaireAbstractQuestion::class,
        ]);
    }
}
