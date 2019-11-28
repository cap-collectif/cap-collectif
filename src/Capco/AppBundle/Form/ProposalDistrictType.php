<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Validator\Constraints\CheckGeoJson;
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
        $builder->add('geojson', TextType::class, [
            'constraints' => [new CheckGeoJson()]
        ]);
        $builder->add('border', BorderStyleType::class, ['required' => false]);
        $builder->add('background', BackgroundStyleType::class, ['required' => false]);
        $builder->addEventSubscriber(new CleanDistrictFieldSubscriber());
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => ProposalDistrict::class
        ]);
    }
}
