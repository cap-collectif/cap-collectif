<?php

namespace Capco\AppBundle\Form\Api;

use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class SynthesisElementType extends AbstractType
{
    protected $hasDivision = true;

    public function __construct($hasDivision = true)
    {
        $this->hasDivision = $hasDivision;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', null, ['required' => false])
            ->add('body', null, ['required' => false])
            ->add('description', null, ['required' => false])
            ->add('published', null, ['required' => false])
            ->add('archived', null, ['required' => false])
            ->add('notation', null, ['required' => false])
            ->add('comment', null, ['required' => false])
            ->add('parent',
                EntityType::class, [
                'class' => SynthesisElement::class,
                'property' => 'id',
                'required' => false,
            ])
            ->add('displayType', null, [
                'required' => true,
            ])
        ;

        if ($this->hasDivision) {
            $builder->add('division', new SynthesisDivisionType(), [
                'required' => false,
                'cascade_validation' => true,
            ]);
        }
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => SynthesisElement::class,
            'csrf_protection' => false,
        ]);
    }
}
