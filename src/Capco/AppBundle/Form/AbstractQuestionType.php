<?php


namespace Capco\AppBundle\Form;


use Capco\AppBundle\Entity\LogicJump;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;

abstract class AbstractQuestionType extends AbstractType
{
    /**
     * @// TODO: delete `private` and `required` during the refacto.
     *
     * @see https://github.com/cap-collectif/platform/issues/6073 tech task.
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('id', IntegerType::class);
        $builder->add('temporaryId', TextType::class);
        $builder->add('title', PurifiedTextType::class, [
            'strip_tags' => true,
            'purify_html' => true,
            'purify_html_profile' => 'default',
        ]);
        $builder->add('helpText', PurifiedTextType::class, [
            'strip_tags' => true,
            'purify_html' => true,
            'purify_html_profile' => 'default',
        ]);
        $builder->add('description', TextType::class, [
            'purify_html' => true,
            'purify_html_profile' => 'default',
        ]);
        $builder->add('alwaysJumpDestinationQuestion', RelayNodeType::class, ['required' => false, 'class' => AbstractQuestion::class]);
        $builder->add('jumps', CollectionType::class, [
            'allow_add' => true,
            'allow_delete' => true,
            'by_reference' => false,
            'entry_type' => LogicJumpType::class,
            'delete_empty' => static function (LogicJump $jump = null) {
                return null === $jump || (null === $jump->getOrigin() && null === $jump->getDestination());
            }
        ]);
        $builder->add('private', CheckboxType::class);
        $builder->add('required', CheckboxType::class);
        $builder->add('type', IntegerType::class);
    }
}
