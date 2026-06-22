<script lang="ts">
  let { content, lastWin }: { content: string; lastWin?: number } = $props();
</script>

<div class="flex flex-col md:gap-1">
  <span class="text-[12px] leading-tight lg:text-xs text-gray-400 uppercase"
    >Last Win</span
  >
  <span
    class="text-[15px] md:text-sm font-medium {lastWin &&
      lastWin > 0 &&
      'text-green-500'}"
  >
    {content}</span
  >
</div>
