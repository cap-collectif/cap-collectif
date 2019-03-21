<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Capco\AppBundle\Entity\District\ProposalDistrict;

class ProposalDistrictAdminType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name', PurifiedTextType::class)
            ->add('geojson')
            ->add('geojsonStyle')
            ->add('displayedOnMap', CheckboxType::class);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => ProposalDistrict::class,
            'csrf_protection' => false,
        ]);
    }
}
