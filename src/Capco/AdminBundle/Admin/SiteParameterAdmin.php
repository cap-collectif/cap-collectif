<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\SiteParameter;
use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\UrlType;

class SiteParameterAdmin extends AbstractAdmin
{
    protected $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'isEnabled'];

    public function toString($object)
    {
        if (!\is_object($object)) {
            return '';
        }

        if (method_exists($object, '__toString') && null !== $object->__toString()) {
            return $this->getConfigurationPool()
                ->getContainer()
                ->get('translator')
                ->trans((string) $object, [], 'CapcoAppBundle');
        }

        return parent::toString($object);
    }

    protected function getHelpText(?string $text = null): ?string
    {
        $txt = '';
        $translator = $this->getConfigurationPool()
            ->getContainer()
            ->get('translator');
        $texts = explode(' ', $text);
        if (\count($texts) > 1) {
            foreach ($texts as $splittedText) {
                $txt .= ' ' . $translator->trans($splittedText, [], 'CapcoAppBundle');
            }

            return $txt;
        }

        return $translator->trans($text, [], 'CapcoAppBundle');
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper->add('isEnabled', null, [
            'label' => 'global.published',
            'required' => false,
        ]);

        /** @var SiteParameter $subject */
        $subject = $this->getSubject();

        // Some parameters are very specific
        switch ($subject->getKeyname()) {
            case 'homepage.jumbotron.margin':
                $formMapper->add('value', ChoiceType::class, [
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

                break;
            case 'global.timezone':
                $formMapper->add('value', ChoiceType::class, [
                    'label' => 'global.timezone',
                    'required' => false,
                    'choices' => $this->getTimezonesList(),
                    'help' => $this->getHelpText($subject->getHelpText()),
                ]);

                return;

                break;
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
                $formMapper->add('value', TextType::class, $options);

                break;
            case SiteParameter::TYPE_RICH_TEXT:
                // Decode the html to be display in BO
                // $subject->setValue(html_entity_decode($subject->getValue()));
                $formMapper->add('value', CKEditorType::class, [
                    'label' => 'global.value',
                    'required' => false,
                    'config_name' => 'admin_editor',
                    'help' => $this->getHelpText($subject->getHelpText()),
                ]);

                break;
            case SiteParameter::TYPE_INTEGER:
                $formMapper->add('value', IntegerType::class, [
                    'label' => 'global.value',
                    'required' => false,
                    'help' => $this->getHelpText($subject->getHelpText()),
                ]);

                break;
            case SiteParameter::TYPE_JS:
                $formMapper->add('value', TextareaType::class, [
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
                $formMapper->add('value', EmailType::class, [
                    'label' => 'global.value',
                    'required' => false,
                    'attr' => ['placeholder' => 'hello@exemple.com'],
                    'help' => $this->getHelpText($subject->getHelpText()),
                ]);

                break;
            case SiteParameter::TYPE_INTERN_URL:
            case SiteParameter::TYPE_URL:
                $formMapper->add('value', UrlType::class, [
                    'label' => 'global.value',
                    'required' => false,
                    'help' => $this->getHelpText($subject->getHelpText()),
                ]);

                break;
            case SiteParameter::TYPE_TEL_NB:
                $formMapper->add('value', null, [
                    'label' => 'global.value',
                    'required' => false,
                    'help' => $this->getHelpText($subject->getHelpText()),
                ]);

                break;
            case SiteParameter::TYPE_BOOLEAN:
                $formMapper->add('value', ChoiceType::class, [
                    'label' => 'global.value',
                    'required' => false,
                    'translation_domain' => 'CapcoAppBundle',
                    'choices' => ['global.enabled' => '1', 'global.disabled' => '0'],
                    'help' => $this->getHelpText($subject->getHelpText()),
                ]);

                break;
            default:
                throw new \RuntimeException('Could not guess how to render your parameter.', 1);

                break;
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['edit']);
    }

    private function getTimezonesList(): array
    {
        $timezones = \DateTimeZone::listIdentifiers(\DateTimeZone::ALL);
        $zones = [];

        foreach ($timezones as $zone) {
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
