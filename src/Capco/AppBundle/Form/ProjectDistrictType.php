<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Capco\AppBundle\Entity\District\ProjectDistrict;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;

class ProjectDistrictType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder->add('translations', TranslationCollectionType::class, [
            'fields' => ['id', 'name', 'locale', 'titleOnMap', 'description'],
        ]);
        $builder->add('displayedOnMap', CheckboxType::class);
        $builder->add('geojson', TextType::class);
        $builder->add('border', BorderStyleType::class, ['required' => false]);
        $builder->add('background', BackgroundStyleType::class, ['required' => false]);
        $builder->add('cover');
        $builder->addEventSubscriber(new CleanDistrictFieldSubscriber());
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => ProjectDistrict::class,
        ]);
    }
}
