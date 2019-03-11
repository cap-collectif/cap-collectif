<?php
namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Questionnaire;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Valid;

class QuestionnaireParametersUpdateType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('acknowledgeReplies', CheckboxType::class)
            ->add('anonymousAllowed', CheckboxType::class)
            ->add('multipleRepliesAllowed', CheckboxType::class)
            ->add('phoneConfirmation', CheckboxType::class);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => Questionnaire::class,
            'constraints' => new Valid(),
        ]);
    }
}
