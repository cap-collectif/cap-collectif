<?php
namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;

class MediaQuestionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('id');
        $builder->add('temporaryId', TextType::class);
        $builder->add('title', PurifiedTextType::class);
        $builder->add('helpText', PurifiedTextType::class);
        $builder->add('description', PurifiedTextType::class);
        $builder->add('private', CheckboxType::class);
        $builder->add('required', CheckboxType::class);
        $builder->add('type', IntegerType::class);
        $builder->add('resultOpen', CheckboxType::class);
        $builder->add('jumps', CollectionType::class, [
            'allow_add' => true,
            'allow_delete' => true,
            'by_reference' => false,
            'entry_type' => LogicJumpType::class,
        ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(['data_class' => MediaQuestion::class, 'csrf_protection' => false]);
    }
}
