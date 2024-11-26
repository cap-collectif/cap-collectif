<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\GraphQL\Mutation\UpdateSiteParameterMutation;
use FOS\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\UrlType;

class SiteParameterAdmin extends AbstractAdmin
{
    protected ?string $classnameLabel = 'site_parameter';
    protected array $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'isEnabled'];

    private readonly UpdateSiteParameterMutation $updateSiteParameterMutation;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        UpdateSiteParameterMutation $updateSiteParameterMutation
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->updateSiteParameterMutation = $updateSiteParameterMutation;
    }

    public function toString($object): string
    {
        if (!\is_object($object)) {
            return '';
        }

        if (method_exists($object, '__toString') && null !== $object->__toString()) {
            return $this->getTranslator()->trans((string) $object, [], 'CapcoAppBundle');
        }

        return parent::toString($object);
    }

    public function postPersist($object): void
    {
        $this->updateSiteParameterMutation->invalidateCache($object);
    }

    public function postUpdate($object): void
    {
        $this->updateSiteParameterMutation->invalidateCache($object);
    }

    protected function getHelpText(?string $text = null): ?string
    {
        $txt = '';
        $texts = explode(' ', $text);
        if (\count($texts) > 1) {
            foreach ($texts as $splittedText) {
                $txt .= ' ' . $this->getTranslator()->trans($splittedText, [], 'CapcoAppBundle');
            }

            return $txt;
        }

        return $this->getTranslator()->trans($text, [], 'CapcoAppBundle');
    }

    protected function configureFormFields(FormMapper $form): void
    {
        $form->add('isEnabled', null, [
            'label' => 'global.published',
            'required' => false,
        ]);

        /** @var SiteParameter $subject */
        $subject = $this->getSubject();

        // Some parameters are very specific
        switch ($subject->getKeyname()) {
            case 'homepage.jumbotron.margin':
                $form->add('value', ChoiceType::class, [
                    'label' => 'global.value',
                    'required' => false,
                    'choices' => [
                        'Pas de marge (0px)' => 0,
                        'Petites marges (50px)' => 50,
                        'Marges par défaut (100px)' => 100,
                        'Grandes marges (150px)' => 150,
                        'Marges importantes (200px)' => 200,
                    ],

                    'help' => $this->getHelpText($subject->getHelpText()),
                ]);

                return;

            case 'global.timezone':
                $form->add('value', ChoiceType::class, [
                    'label' => 'global.timezone',
                    'required' => false,
                    'choices' => $this->getTimezonesList(),
                    'help' => $this->getHelpText($subject->getHelpText()),
                ]);

                return;

            default:
                break;
        }

        // Otherwise we render based on the type
        switch ($subject->getType()) {
            case SiteParameter::TYPE_SIMPLE_TEXT:
                $options = [
                    'label' => 'global.value',
                    'required' => false,
                    'help' => $this->getHelpText($subject->getHelpText()),
                ];
                if ($subject->isSocialNetworkDescription()) {
                    $options['help'] = 'admin.help.metadescription';
                    $options['attr']['max_length'] = 160;
                }
                $form->add('value', TextType::class, $options);

                break;

            case SiteParameter::TYPE_RICH_TEXT:
                // Decode the html to be display in BO
                // $subject->setValue(html_entity_decode($subject->getValue()));
                $form->add('value', CKEditorType::class, [
                    'label' => 'global.value',
                    'required' => false,
                    'config_name' => 'admin_editor',
                    'help' => $this->getHelpText($subject->getHelpText()),
                ]);

                break;

            case SiteParameter::TYPE_INTEGER:
                $form->add('value', IntegerType::class, [
                    'label' => 'global.value',
                    'required' => false,
                    'help' => $this->getHelpText($subject->getHelpText()),
                ]);

                break;

            case SiteParameter::TYPE_JS:
                $form->add('value', TextareaType::class, [
                    'label' => 'global.value',
                    'required' => false,
                    'help' => $this->getHelpText($subject->getHelpText()),
                    'attr' => [
                        'rows' => 10,
                        'placeholder' => '<script type="text/javascript"> </script>',
                    ],
                ]);

                break;

            case SiteParameter::TYPE_EMAIL:
                $form->add('value', EmailType::class, [
                    'label' => 'global.value',
                    'required' => false,
                    'attr' => ['placeholder' => 'hello@exemple.com'],
                    'help' => $this->getHelpText($subject->getHelpText()),
                ]);

                break;

            case SiteParameter::TYPE_INTERN_URL:
            case SiteParameter::TYPE_URL:
                $form->add('value', UrlType::class, [
                    'label' => 'global.value',
                    'required' => false,
                    'help' => $this->getHelpText($subject->getHelpText()),
                ]);

                break;

            case SiteParameter::TYPE_TEL_NB:
                $form->add('value', null, [
                    'label' => 'global.value',
                    'required' => false,
                    'help' => $this->getHelpText($subject->getHelpText()),
                ]);

                break;

            case SiteParameter::TYPE_BOOLEAN:
                $form->add('value', ChoiceType::class, [
                    'label' => 'global.value',
                    'required' => false,
                    'translation_domain' => 'CapcoAppBundle',
                    'choices' => ['global.enabled' => '1', 'global.disabled' => '0'],
                    'help' => $this->getHelpText($subject->getHelpText()),
                ]);

                break;

            default:
                throw new \RuntimeException('Could not guess how to render your parameter.', 1);
        }
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['edit']);
    }

    protected function configure(): void
    {
        $this->setTemplate('edit', '@CapcoAdmin/CRUD/edit.html.twig');
    }

    private function getTimezonesList(): array
    {
        $timezones = \DateTimeZone::listIdentifiers(\DateTimeZone::ALL);
        $zones = [];

        foreach ($timezones as $zone) {
            if ('UTC' === $zone) {
                continue;
            }

            $zones[$zone] = sprintf(
                '%s (GMT%s)',
                self::formatTimezoneName($zone),
                (new \DateTime('now', new \DateTimeZone($zone)))->format('P')
            );
        }

        return $zones;
    }

    private static function formatTimezoneName(string $name): string
    {
        return str_replace(['_', 'St '], [' ', 'St. '], $name);
    }
}
