<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\CallbackTransformer;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class MediaQuestionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('title', PurifiedTextType::class);
        $builder->add('helpText', PurifiedTextType::class);
        $builder->add('private', CheckboxType::class);
        $builder->add('required', CheckboxType::class);
        $builder->add('type', IntegerType::class);

        $builder->get('type')->addModelTransformer(new CallbackTransformer(
            function ($typeAsInteger) {
                return AbstractQuestion::$questionTypesInputs[$typeAsInteger];
            },
            function ($typeAsString) {
                return array_search($typeAsString, AbstractQuestion::$questionTypesInputs, true);
            }
        ))
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => MediaQuestion::class,
            'csrf_protection' => false,
        ]);
    }
}
