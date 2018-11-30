<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\District\ProjectDistrict;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProjectDistrictType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('name', TextType::class);
        $builder->add('displayedOnMap', CheckboxType::class);
        $builder->add('geojson', TextType::class);
        $builder->add('border', BorderStyleType::class);
        $builder->add('background', BackgroundStyleType::class);
        $builder->addEventSubscriber(new CleanDistrictFieldSubscriber());
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => ProjectDistrict::class,
        ]);
    }
}
