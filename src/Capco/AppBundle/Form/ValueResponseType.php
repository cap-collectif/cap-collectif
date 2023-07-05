<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ValueResponseType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('value', TextType::class)
            ->add('question', EntityType::class, ['class' => AbstractQuestion::class])
        ;

        $builder->add('position', HiddenType::class, [
            'mapped' => false,
        ]);

        $builder->add(AbstractResponse::TYPE_FIELD_NAME, HiddenType::class, [
            'data' => $this->getBlockPrefix(),
            'mapped' => false,
        ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => ValueResponse::class,
            'model_class' => ValueResponse::class,
            'allow_extra_fields' => true,
        ]);
    }

    public function getBlockPrefix(): string
    {
        return 'value_response';
    }
}
