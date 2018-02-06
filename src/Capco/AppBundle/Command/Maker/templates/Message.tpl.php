<?php echo "<?php\n"; ?>

namespace Capco\AppBundle\Mailer\Message<?php if (isset($command_entity_name)): ?>\<?php echo $command_entity_name; ?><?php endif; ?>;

use Capco\AppBundle\Mailer\Message\<?php echo $command_message_type; ?>;<?php echo PHP_EOL; ?>
<?php if (isset($command_related_entity_fqcn)): ?>use <?php echo $command_related_entity_fqcn; ?>;<?php echo PHP_EOL; ?><?php endif; ?>
<?php echo PHP_EOL; ?>
final class <?php echo $command_class_name; ?> extends <?php echo $command_message_type; ?><?php echo PHP_EOL; ?>
{
    public static function create(
<?php if (isset($command_entity_name) && isset($command_related_entity_fqcn)): ?>
        <?php echo $command_entity_name; ?> $<?php echo $command_entity_name_camelCase; ?>,
<?php endif; ?>
        string $recipentEmail,
        string $recipientName = null
    ): self
    {
        return new self(
            $recipentEmail,
            $recipientName,
            '<?php echo $command_subject_template; ?>',
            static::getMySubjectVars(),
            '<?php echo $command_content_template; ?>',
            static::getMyTemplateVars()
        );
    }

    private static function getMyTemplateVars(
<?php if (isset($command_template_vars)): ?>
<?php foreach ($command_template_vars as $template_var): ?>
<?php if (next($command_template_vars)): ?>
        $<?php echo $template_var; ?>,<?php echo PHP_EOL; ?>
<?php else: ?>
        $<?php echo $template_var; ?><?php echo PHP_EOL; ?>
<?php endif; ?>
<?php endforeach; ?>
<?php endif; ?>
    ): array
    {
        return [
<?php if (isset($command_template_vars)): ?>
<?php foreach ($command_template_vars as $template_var): ?>
<?php if (next($command_template_vars)): ?>
            '{<?php echo $template_var; ?>}' => $<?php echo $template_var; ?>,<?php echo PHP_EOL; ?>
<?php else: ?>
            '{<?php echo $template_var; ?>}' => $<?php echo $template_var; ?><?php echo PHP_EOL; ?>
<?php endif; ?>
<?php endforeach; ?>
<?php endif; ?>
        ];
    }

    private static function getMySubjectVars(
<?php if (isset($command_subject_vars)): ?>
<?php foreach ($command_subject_vars as $subject_var): ?>
<?php if (next($command_subject_vars)): ?>
        $<?php echo $subject_var; ?>,<?php echo PHP_EOL; ?>
<?php else: ?>
        $<?php echo $subject_var; ?><?php echo PHP_EOL; ?>
<?php endif; ?>
<?php endforeach; ?>
<?php endif; ?>
    ): array
    {
        return [
<?php if (isset($command_subject_vars)): ?>
<?php foreach ($command_subject_vars as $subject_var): ?>
<?php if (next($command_subject_vars)): ?>
            '{<?php echo $subject_var; ?>}' => $<?php echo $subject_var; ?>,<?php echo PHP_EOL; ?>
<?php else: ?>
            '{<?php echo $subject_var; ?>}' => $<?php echo $subject_var; ?><?php echo PHP_EOL; ?>
<?php endif; ?>
<?php endforeach; ?>
<?php endif; ?>
        ];
    }
}
