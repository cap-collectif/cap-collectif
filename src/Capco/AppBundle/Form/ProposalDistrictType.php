<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\District;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProposalDistrictType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('id');
        $builder->add('name', TextType::class);
        $builder->add('displayedOnMap', CheckboxType::class);
        $builder->add('geojson', TextType::class);
        $builder->add('geojsonStyle', TextType::class, ['required' => false]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => District::class,
        ]);
    }
}
